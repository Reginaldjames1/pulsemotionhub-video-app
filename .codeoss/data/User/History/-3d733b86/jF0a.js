// server.js — PulseMotionHub backend (Express on Render)
// Features: Static hosting, Image→Video proxy (placeholder), Stripe Payments, CORS, Firebase-ready

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';
import Stripe from 'stripe';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables (.env or Render Environment)
dotenv.config();

const app = express();

// ---------- ENV VARIABLES ----------
const {
  PORT = 8080,
  NODE_ENV = 'production',

  // Optional for external integrations
  STABILITY_API_KEY,

  // ✅ Stripe Keys (replace with your real ones later)
  STRIPE_SECRET_KEY = 'sk_test_your_secret_key_here',
  STRIPE_PRICE_STARTER = 'price_your_starter_id_here',
  STRIPE_PRICE_CREATOR_MONTHLY = 'price_your_creator_id_here',
  STRIPE_PRICE_PRO_STUDIO = 'price_your_pro_id_here',
  STRIPE_WEBHOOK_SECRET = 'whsec_your_webhook_secret_here',
  FRONTEND_URL = 'https://pulsemotionhub.onrender.com'
} = process.env;

// ---------- INITIALIZE STRIPE ----------
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-01' // Keep updated per Stripe docs
});

// ---------- EXPRESS MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend (if deployed together)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// ---------- STRIPE CHECKOUT ROUTE ----------
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { plan } = req.body;
    let priceId;

    switch (plan) {
      case 'starter':
        priceId = STRIPE_PRICE_STARTER;
        break;
      case 'creator':
        priceId = STRIPE_PRICE_CREATOR_MONTHLY;
        break;
      case 'pro':
        priceId = STRIPE_PRICE_PRO_STUDIO;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- STRIPE WEBHOOK (optional) ----------
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types here if needed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Checkout session completed:', session.id);
  }

  res.json({ received: true });
});

// ---------- TEST ROUTE ----------
app.get('/ping', (req, res) => {
  res.json({ message: 'PulseMotionHub API is live 🚀' });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ PulseMotionHub server running on port ${PORT} [${NODE_ENV}]`);
});
