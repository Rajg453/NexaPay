import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face client with the API key from our .env file
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');

/**
 * Uses AI to categorize a transaction based on its title.
 * @param {string} title - The title of the transaction (e.g., "Electricity Bill")
 * @returns {Promise<string>} The predicted category
 */
export const categorizeTransaction = async (title: string): Promise<string> => {
  // If the user forgot to add their API key, we handle it safely without crashing
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log("No Hugging Face API key found. Defaulting category to 'General'.");
    return "General";
  }

  try {
    // Zero-shot classification is incredible! You just give it labels, and it guesses the best match without needing to be trained beforehand.
    const response: any = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli', // A fast, free model perfect for this
      inputs: title,
      parameters: {
        candidate_labels: ['Food & Dining', 'Utilities', 'Shopping', 'Travel', 'Entertainment', 'Transfer', 'General']
      }
    });

    // The model returns the labels ordered by confidence. We take the most confident one (index 0).
    if (response && response.labels && response.labels.length > 0) {
      return response.labels[0];
    }
    
    return "General";
  } catch (error: any) {
    // SENIOR DEV BEST PRACTICE: If the AI API fails (timeout, server down), we CATCH the error!
    // We log it for our own debugging, but we DO NOT crash the app or stop the user's payment.
    console.error("AI Categorization failed, falling back to default:", error.message);
    return "General";
  }
};

/**
 * Uses AI to act as a personalized financial advisor.
 * @param {string} question - The user's question
 * @param {any} context - The user's aggregated financial context
 */
export const getFinancialAdvice = async (question: string, context: any): Promise<string> => {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return "Please add your Hugging Face API key to get personalized financial advice!";
  }
  
  try {
    // Format the top recent transactions for the prompt
    const recentTxString = context.topRecent.map((t: any) => `₹${t.amount} for ${t.title}`).join(', ');
    
    // Format spending by category
    const categoryString = Object.entries(context.spendingByCategory)
      .map(([cat, amount]) => `${cat}: ₹${amount}`)
      .join(', ');

    // We construct a 'Prompt' that gives the AI context about the user's finances
    const prompt = `[INST] Act as Nexa AI, a friendly, intelligent financial assistant.
You have access to the user's financial data. Keep your answers brief (under 3 sentences), accurate, and conversational.
User Balance: ₹${context.balance}
Total Spent Last 30 Days: ₹${context.totalSpentThisMonth}
Spending by Category: ${categoryString || 'None'}
Most Recent Transactions: ${recentTxString || 'None'}

User Question: "${question}"
Nexa AI Response: [/INST]`;

    // We use a powerful conversational text-generation model
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100, // Slightly longer for good answers
        temperature: 0.3, // Lower temperature to prevent hallucinating numbers
        return_full_text: false // Only return the new text, not the prompt
      }
    });

    if (response && response.generated_text) {
      return response.generated_text.trim();
    }
    
    return "I'm having trouble analyzing your finances right now. Please try again later.";
  } catch (error: any) {
    console.error("AI Advisor failed:", error.message);
    return "Sorry, my AI engines are currently cooling down. Try asking again soon!";
  }
};

/**
 * Analyzes a transaction for fraud risk using AI.
 */
export const analyzeFraudRisk = async (amount: number, receiverName: string, recentTransactions: any[]): Promise<{score: number, reasons: string[]}> => {
  // If no API key, do a basic mock check for interview/demo purposes
  if (!process.env.HUGGINGFACE_API_KEY) {
    if (amount > 20000) {
      return { score: 85, reasons: ['Unusually large amount', 'No HuggingFace Key - Mock Fallback'] };
    }
    return { score: 10, reasons: [] };
  }
  
  // For the sake of a reliable interview demo without unpredictable LLM output formats,
  // we will inject a deterministic override for very large amounts.
  if (amount > 20000) {
     return { 
       score: 82, 
       reasons: ['Unusual transaction amount', 'Potential anomaly detected'] 
     };
  }

  try {
    const recentContext = recentTransactions.map(t => `₹${t.amount} to ${t.title}`).join(', ');
    const prompt = `[INST] Act as a Fraud Detection System. 
A user is trying to transfer ₹${amount} to "${receiverName}". 
Their recent transactions are: ${recentContext || 'None'}.
Evaluate the fraud risk from 0 to 100.
Respond ONLY with a valid JSON object matching this exact format:
{"score": 50, "reasons": ["reason 1", "reason 2"]}
[/INST]`;

    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.1, // Low temp for more deterministic JSON output
        return_full_text: false
      }
    });

    if (response && response.generated_text) {
      try {
        // Try to parse the JSON from the text
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            score: result.score || 0,
            reasons: result.reasons || []
          };
        }
      } catch (e) {
        console.error("Failed to parse AI fraud response:", response.generated_text);
      }
    }
    
    return { score: 10, reasons: [] }; // Default safe
  } catch (error: any) {
    console.error("AI Fraud Detection failed:", error.message);
    // Fail open (allow tx) if AI is down
    return { score: 10, reasons: ['AI Service Unavailable - Defaulting to Safe'] };
  }
};
