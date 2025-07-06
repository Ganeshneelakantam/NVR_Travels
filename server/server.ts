import express from 'express';
import twilio from 'twilio';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'] })); // Allow requests from your React app

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Missing required Twilio credentials in .env file. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
}

const client = twilio(accountSid, authToken);

// Endpoint to send SMS
// app.post('/api/send-sms', async (req, res) => {
//   const { to, body } = req.body;

//   try {
//     const message = await client.messages.create({
//       body,
//       from: twilioPhoneNumber,
//       to,
//     });
//     res.json({ success: true, messageId: message.sid });
//   } catch (error) {
//     console.error('Error sending SMS:', error);
//     res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
//   }
// });

// Endpoint to send WhatsApp message
app.post('/api/send-whatsapp', async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${twilioPhoneNumber}`, // Use WhatsApp namespace
      to: `whatsapp:${to}`, // Use WhatsApp namespace
    });
    res.json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
