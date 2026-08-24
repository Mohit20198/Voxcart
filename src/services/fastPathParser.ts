export interface ParsedCommand {
  action: "add" | "remove" | "modify";
  itemName: string;
  quantity?: number;
  unit?: string;
}

// Strip common conversational suffixes from item names
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
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const parseCommand = (transcript: string): ParsedCommand | null => {
  const normalized = transcript.toLowerCase().trim();

  // If it's a compound sentence, let the AI handle it
  if (normalized.includes(',') || normalized.includes(' remove ') || normalized.includes(' add ')) {
    return null;
  }

  // 1. MATCH ADD COMMANDS
  // Matches: "add milk", "add 2 bottles of water", "add 5 oranges", "i need bread", "buy apples"
  const addRegex = /^(?:add|buy|i need|i want)\s+(?:(\d+)\s+)?(?:(bottles of|gallons of|lbs of|cans of|packs of|bunches of|boxes of|bags of|units of|pieces of|liters of|kg of)\s+)?(.+)$/;
  const addMatch = normalized.match(addRegex);
  
  if (addMatch) {
    return {
      action: "add",
      quantity: addMatch[1] ? parseInt(addMatch[1], 10) : 1,
      unit: addMatch[2] ? addMatch[2].replace(' of', '').trim() : undefined,
      itemName: sanitizeItemName(addMatch[3].trim())
    };
  }

  // 2. MATCH REMOVE COMMANDS
  // Matches: "remove milk", "delete eggs", "take bread off the list"
  const removeRegex1 = /^(?:remove|delete)\s+(.+)$/;
  const removeRegex2 = /^take\s+(.+)\s+off the list$/;
  
  const removeMatch = normalized.match(removeRegex1) || normalized.match(removeRegex2);
  if (removeMatch) {
    return {
      action: "remove",
      itemName: removeMatch[1].trim()
    };
  }

  // 3. MATCH MODIFY COMMANDS
  // Matches: "change milk to 3", "update apples to 5", "make milk 2"
  const modifyRegex1 = /^(?:change|update)\s+(.+)\s+to\s+(\d+)$/;
  const modifyRegex2 = /^make\s+(.+)\s+(\d+)$/;
  
  const modifyMatch = normalized.match(modifyRegex1) || normalized.match(modifyRegex2);
  if (modifyMatch) {
    return {
      action: "modify",
      itemName: modifyMatch[1].trim(),
      quantity: parseInt(modifyMatch[2], 10)
    };
  }

  // If no confident deterministic match, return null to signal AI fallback
  return null;
};
