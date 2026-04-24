import twilio from 'twilio';

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // In development/local setup, allow backend to run without Twilio config.
  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

export const sendSMS = async (to, message) => {
  try {
    const client = getTwilioClient();

    if (!client) {
      console.log('SMS not configured. Message would be:', message);
      return { success: true, message: 'SMS not configured (dev mode)' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent: ', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error: ', error);
    throw error;
  }
};

export default sendSMS;
