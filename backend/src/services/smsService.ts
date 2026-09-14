import twilio from 'twilio';

// Detailed explanation: We fetch the Twilio credentials from our environment variables.
// In a real application, you sign up for Twilio to get these keys.
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'dummy_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'dummy_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Detailed explanation: Initialize the Twilio client.
const client = twilio(accountSid, authToken);

// Detailed explanation: This function sends an SMS message using Twilio.
export const sendSMS = async (to: string, body: string) => {
  try {
    // If we don't have real credentials, we just mock the send.
    if (accountSid === 'dummy_account_sid') {
      console.log(`[MOCK SMS] To: ${to} | Message: ${body}`);
      return;
    }

    // Call the Twilio API to create and send a message.
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log(`SMS sent successfully: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // We don't want to crash the app if an SMS fails to send, so we just log the error.
  }
};
