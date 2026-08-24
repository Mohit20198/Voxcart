export interface MatchResult {
  text: string;
  score: number;
}

export interface MatchResponse {
  matches: MatchResult[];
  bestMatch: string | null;
  bestScore: number | null;
  ambiguous?: boolean;
}

export const matchProduct = async (query: string, candidates: string[]): Promise<MatchResponse> => {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

  try {
    const response = await fetch(`${ML_SERVICE_URL}/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, candidates }),
    });

    if (!response.ok) {
      console.error(`ML Service returned status ${response.status}`);
      return { bestMatch: null, bestScore: null, matches: [] };
    }

    const data = await response.json();
    return data as MatchResponse;
  } catch (error) {
    console.error('Error connecting to ML service:', error);
    // Graceful fallback if ML service is down
    return { bestMatch: null, bestScore: null, matches: [] };
  }
};
