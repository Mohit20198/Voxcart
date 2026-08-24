import OpenAI from 'openai';
import * as listService from './listService';
import { getOrFetchProducts } from './productCache';
import { matchProduct } from './mlService';
import { categorizeItem } from './categorize';
import { getCombinedRecommendations } from './recommendationEngine';
import { substitutesMap } from './substitutes';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

const AGENT_MODEL = process.env.AGENT_MODEL || 'deepseek/deepseek-chat';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'add_item',
      description: 'Add an item to the shopping list',
      parameters: {
        type: 'object',
        properties: {
          itemName: { type: 'string', description: "The core name of the product to add, WITHOUT conversational words like 'in cart' (e.g. use 'milk', not 'milk in cart')." },
          quantity: { type: 'number' },
          unit: { type: 'string' },
        },
        required: ['itemName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_item',
      description: 'Remove an item from the shopping list',
      parameters: {
        type: 'object',
        properties: {
          itemName: { type: 'string' },
        },
        required: ['itemName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'modify_item',
      description: 'Modify the quantity of an item in the shopping list',
      parameters: {
        type: 'object',
        properties: {
          itemName: { type: 'string' },
          quantity: { type: 'number' },
        },
        required: ['itemName', 'quantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the product catalog (Open Food Facts)',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          priceMax: { type: 'number' },
          priceMin: { type: 'number' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_substitutes',
      // Note: This LLM-driven path handles conversational requests for substitutes in Vox ("what can I use instead of milk?").
      // The passive UI row in Product Detail uses a separate, fast ML embedding path (GET /substitutes/:itemName) to stay grounded in the catalog and save LLM costs.
      description: 'Finds substitutes or alternatives for a specific product. ALWAYS use this tool when a user asks about substitutes or alternatives, do not answer from general knowledge.',
      parameters: {
        type: 'object',
        properties: {
          itemName: { type: 'string' },
        },
        required: ['itemName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recommendations',
      description: 'Searches for product recommendations or seasonal specials. Used when the user asks for general recommendations, ideas, or what\'s popular.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fuzzy_match_item',
      description: 'Use ML to fuzzy match a spoken query against items currently in the user\'s active shopping list. Use this to find which item they mean if the name is slightly off.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_cart_items',
      description: 'Get all the items currently in the user\'s active shopping list/cart.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

// In-memory conversation history (Note: resets on server restart. Production would persist this)
const conversationHistory = new Map<string, OpenAI.Chat.Completions.ChatCompletionMessageParam[]>();

export interface AgentResult {
  reply: string | null;
  actionsPerformed: { tool: string; input: any; result: any }[];
  needsClarification: boolean;
}

export const runAgent = async (userId: string, transcript: string): Promise<AgentResult> => {
  if (!process.env.OPENROUTER_API_KEY) {
    return {
      reply: 'Sorry, I am having trouble connecting to my AI brain right now (Missing API Key).',
      actionsPerformed: [],
      needsClarification: false,
    };
  }

  let history = conversationHistory.get(userId) || [];
  
  if (history.length === 0) {
    history.push({
      role: 'system',
      content: `You are the VoxCart AI agent, a helpful grocery shopping assistant. 
You can add, remove, or modify items in the user's list, search for products, find substitutes, get recommendations, and view the current cart items.
IMPORTANT: If a user's request is ambiguous, uncertain, or could match multiple things, DO NOT GUESS. Instead, ask a clarifying question in your text response.
Only call tools when you are confident about the action. If the user asks for specific recommendations (e.g., 'recommend some snacks' or 'suggest fruits'), use the search_products tool with the appropriate category query instead of get_recommendations. Use get_recommendations only for general 'what should I buy' or 'what do I usually need' queries.

CRITICAL FORMATTING RULES:
1. When you use search_products, get_recommendations, or list_cart_items, NEVER list the items in your text reply using bullet points or numbers IF items are found. The UI automatically displays the results as visual cards. Simply say a short conversational sentence ending in a question mark, e.g., 'I found these options. Which would you like?' or 'Here is your cart. Need to change anything?'. If the tool returns an empty result, just tell the user clearly that nothing was found. For find_substitutes, you SHOULD list the substitute text naturally.
2. Always respond with a natural, conversational confirmation message after performing any action (e.g., 'Added milk to your cart!', 'Done!'), never leave reply empty.
3. When a user asks about substitutes or alternatives for an item, ALWAYS call the find_substitutes tool rather than answering from general knowledge — our hardcoded substitution map is the source of truth for this app.
4. MULTILINGUAL SUPPORT: Always reply in the exact language the user's message was written or spoken in. If the user writes in Hindi, reply in Hindi. If in Spanish, reply in Spanish. If in English, reply in English. Do not use English if the user communicated in another language.
5. TRANSLATION FOR TOOLS: The product catalog and all backend systems are exclusively in English. When you extract items from a non-English transcript to use in a tool (e.g. add_item, search_products), you MUST translate the item names to English before calling the tool (e.g. translate 'दूध' to 'milk', 'pan' to 'bread').
6. TOOL ARGUMENT FORMATTING: When extracting item names for tools (like add_item or search_products), extract ONLY the core product name. For example, if the user says "add milk in cart", pass "milk" as the itemName, NOT "milk in cart".
7. MARKETPLACE ACCURACY: DO NOT blindly add random items (like "samosa", "laptop") to the cart if they are not typical grocery items. If a user asks to add something unusual, politely inform them it's not available in the marketplace instead of adding it.`,
    });
  }

  history.push({ role: 'user', content: transcript });

  const actionsPerformed: { tool: string; input: any; result: any }[] = [];
  let currentTurn = 0;
  const maxTurns = 5;
  let finalReply: string | null = null;
  let needsClarification = false;

  while (currentTurn < maxTurns) {
    try {
      const response = await openai.chat.completions.create({
        model: AGENT_MODEL,
        messages: history,
        tools: tools,
        tool_choice: 'auto',
      });

      const message = response.choices[0].message;
      history.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          if (toolCall.type !== 'function') continue;
          
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let result: any;

// Strip common conversational suffixes the LLM sometimes appends to item names
const STRIP_SUFFIXES = [
  ' in cart', ' to cart', ' to my cart', ' to the cart',
  ' in list', ' to list', ' to my list', ' to the list',
  ' in my cart', ' in the cart', ' in my list', ' in the shopping list',
  ' to shopping list', ' to my shopping list',
];
function sanitizeItemName(name: string): string {
  let cleaned = name.trim().toLowerCase();
  for (const suffix of STRIP_SUFFIXES) {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.slice(0, cleaned.length - suffix.length).trim();
    }
  }
  // Title-case the first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

          try {
            switch (functionName) {
              case 'add_item': {
                const cleanName = sanitizeItemName(args.itemName);
                const cat = categorizeItem(cleanName);
                result = await listService.addListItem({
                  userId,
                  itemName: cleanName,
                  quantity: args.quantity || 1,
                  unit: args.unit || '',
                  category: cat
                });
                break;
              }
              case 'remove_item': {
                const item = await listService.findActiveItemByName(userId, args.itemName);
                if (item) {
                  await listService.removeListItem(item.id!);
                  result = { success: true, item };
                } else {
                  result = { error: 'Item not found in active list.' };
                }
                break;
              }
              case 'modify_item': {
                const item = await listService.findActiveItemByName(userId, args.itemName);
                if (item) {
                  await listService.updateItemQuantity(item.id!, args.quantity);
                  result = { success: true, item: { ...item, quantity: args.quantity } };
                } else {
                  result = { error: 'Item not found in active list.' };
                }
                break;
              }
              case 'search_products': {
                const searchRes = await getOrFetchProducts(args.query);
                let filtered = searchRes.products;
                if (args.priceMax !== undefined) {
                  filtered = filtered.filter(p => p.price <= args.priceMax);
                }
                if (args.priceMin !== undefined) {
                  filtered = filtered.filter(p => p.price >= args.priceMin);
                }
                if (filtered.length === 0) {
                  result = { error: 'No products found matching the criteria.' };
                } else {
                  result = { products: filtered, fromCache: searchRes.fromCache };
                }
                break;
              }
              case 'find_substitutes': {
                const query = args.itemName.toLowerCase();
                // Basic matching for the hardcoded map
                const match = Object.keys(substitutesMap).find(k => query.includes(k) || k.includes(query));
                result = match ? substitutesMap[match] : ['No known substitutes found.'];
                break;
              }
              case 'get_recommendations': {
                const uid = args.userId || userId;
                const activeItems = await listService.getActiveListItems(uid);
                const activeItemNames = activeItems.map(i => i.itemName);
                result = await getCombinedRecommendations(uid, activeItemNames);
                break;
              }
              case 'fuzzy_match_item': {
                const uid = args.userId || userId;
                const activeItems = await listService.getActiveListItems(uid);
                const candidates = activeItems.map(i => i.itemName);
                if (candidates.length === 0) {
                  result = { error: 'No active items in list to match against.' };
                } else {
                  result = await matchProduct(args.query, candidates);
                }
                break;
              }
              case 'list_cart_items': {
                const activeItems = await listService.getActiveListItems(userId);
                result = { items: activeItems };
                break;
              }
              default:
                result = { error: 'Unknown function call.' };
            }
          } catch (err: any) {
            console.error(`Error executing tool ${functionName}:`, err);
            result = { error: err.message };
          }

          actionsPerformed.push({ tool: functionName, input: args, result });

          history.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
        currentTurn++;
      } else {
        // No tool calls, we have a final reply
        finalReply = message.content;
        
        // Simple heuristic for clarification: if it ends with a question mark
        if (finalReply && finalReply.trim().endsWith('?')) {
          needsClarification = true;
        }
        break;
      }
    } catch (error) {
      console.error('Error during OpenRouter API call:', error);
      return {
        reply: 'Sorry, I encountered an internal error while thinking.',
        actionsPerformed,
        needsClarification: false,
      };
    }
  }

  // Keep only the last 10 messages (system prompt + up to 9 turns)
  if (history.length > 11) {
    history = [history[0], ...history.slice(history.length - 10)];
  }
  conversationHistory.set(userId, history);

  return {
    reply: finalReply,
    actionsPerformed,
    needsClarification,
  };
};
