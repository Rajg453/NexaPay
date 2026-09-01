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
 * @param {number} balance - The user's current wallet balance
 * @param {Array} recentTransactions - The user's recent transaction history
 */
export const getFinancialAdvice = async (question: string, balance: number, recentTransactions: any[]): Promise<string> => {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return "Please add your Hugging Face API key to get personalized financial advice!";
  }
  
  try {
    // We construct a 'Prompt' that gives the AI context about the user's finances
    const prompt = `Context: The user has a wallet balance of ₹${balance}. 
Their recent transactions are: ${recentTransactions.map(t => `${t.title} (₹${t.amount})`).join(', ')}.
User Question: "${question}"
Financial Advice (Keep it short, friendly, and under 2 sentences):`;

    // We use a powerful conversational text-generation model
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 60, // Keep the reply short and snappy
        temperature: 0.7, // Professional but slightly creative
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
