import { Request, Response } from 'express';
// Import our AI service logic
import { categorizeTransaction } from '../services/aiService';

/**
 * Controller function for handling the categorization request.
 * The controller's job is simply to receive the request from the route,
 * call the appropriate service to do the heavy lifting,
 * and send the response back to the user.
 */
export const categorizeExpenseHandler = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        // Extract the "transactionText" from the data the frontend sent us
        const { transactionText } = req.body;

        // Check if the frontend actually sent some text. If not, return an error.
        if (!transactionText) {
            return res.status(400).json({ error: 'Please provide a transaction text' });
        }

        // Call our AI service to figure out the category
        const category = await categorizeTransaction(transactionText);

        // Send the result back to the frontend in a JSON format
        res.json({ category: category });
        
    } catch (error) {
        // If anything goes wrong, log it and send an error to the frontend
        console.error("Error in categorization controller:", error);
        res.status(500).json({ error: 'Failed to categorize expense' });
    }
};
