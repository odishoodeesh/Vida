export interface AdviceResponse {
  reply: string;
  recommendedProductIds: string[];
}

export async function askAlchemist(
  message: string,
  history: { role: 'user' | 'model'; parts: string[] }[] = [],
  language: string = 'en'
): Promise<AdviceResponse> {
  try {
    const response = await fetch("/api/alchemist/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, history, language })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Alchemist Client Error:", error);
    return {
      reply: "The Alchemist is currently preparing botanical tinctures. Please try again in a moment.",
      recommendedProductIds: []
    };
  }
}

// Interactive Skin/Hair type diagnostics function
export async function diagnoseRoutine(answers: {
  skinType: string;
  primaryConcern: string;
  hairGoals?: string;
  sensitivity: string;
}, language: string = 'en'): Promise<AdviceResponse> {
  try {
    const response = await fetch("/api/alchemist/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answers, language })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Diagnosis Client Error:", error);
    return {
      reply: "The Alchemist is currently preparing botanical tinctures. Please try again in a moment.",
      recommendedProductIds: []
    };
  }
}
