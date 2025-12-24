import express from 'express';
import Joi from 'joi';
import User from '../models/User.js';
import validate from '../middleware/validate.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

const REG_FEE_NAIRA = parseInt(process.env.REGISTRATION_FEE_NAIRA || '1500', 10);
const REG_FEE_KOBO = REG_FEE_NAIRA * 100;

const validateToken = async (token) => {
  const user = await User.findOne({ registrationToken: token });
  if (!user) return { error: 'Invalid token.' };
  if (user.tokenUsed) return { error: 'Token already used.' };
  if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) return { error: 'Token expired.' };
  return { user };
};


router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { user, error } = await validateToken(token);
    if (error) return res.status(400).json({ message: error });

    return res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      profession: user.profession,
      programType: user.programType,
      registrationFee: REG_FEE_NAIRA,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const initPaymentSchema = Joi.object({});

router.post('/paystack/:token/init', validate(initPaymentSchema), async (req, res) => {
  try {
    const { token } = req.params;
    const { user, error } = await validateToken(token);
    if (error) return res.status(400).json({ message: error });

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    const reference = `REG-${user._id.toString()}`;
    const callbackUrl = process.env.PAYSTACK_REG_CALLBACK_URL || '';

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: REG_FEE_KOBO,
        reference,
        callback_url: callbackUrl,
      }),
    });

    const initJson = await initRes.json();
    if (!initJson.status) {
      return res.status(400).json({ message: 'Failed to initialize payment', details: initJson });
    }

    res.json({
      authorizationUrl: initJson.data.authorization_url,
      reference: initJson.data.reference,
      accessCode: initJson.data.access_code,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/paystack/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(400).json({ message: 'Webhook not configured' });
    }

    const crypto = await import('node:crypto');
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    if (event?.event === 'charge.success') {
      const ref = event.data?.reference;
      const amount = event.data?.amount;
      if (amount !== REG_FEE_KOBO) {
        console.warn('Unexpected registration payment amount', amount);
      }

      const userId = ref?.replace('REG-', '');
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.accountStatus = 'Active';
          user.paymentStatus = 'Paid';
          user.tokenUsed = true;
          user.paymentReference = ref;
          await user.save();

          const appUrl = process.env.APP_PUBLIC_URL || '';
          const loginLink = appUrl.replace(/\/$/, '') + '/login';
          const subject = 'Payment Received - Account Activated';
          const html = `
            <p>Dear ${user.name},</p>
            <p>Your payment has been received and your account is now active!</p>
            <p><strong>Login Credentials:</strong></p>
            <p>Email: ${user.email}<br/>Password: Techhubpassword1</p>
            <p><strong>IMPORTANT:</strong> You will be required to change your password on first login.</p>
            <p>Click here to login: <a href="${loginLink}">${loginLink}</a></p>
            <p>Best regards,<br/>TechHub Team</p>
          `;

          try {
            await sendEmail({ to: user.email, subject, html });
          } catch (e) {
            console.error('Failed to send payment confirmation email', e);
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
