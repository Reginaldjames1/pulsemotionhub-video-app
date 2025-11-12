// server.js — PulseMotionHub backend (Express on Render)
// Features: Static hosting, Image→Video proxy (placeholder),
// Stripe / PayPal / Coinbase Commerce checkout + webhooks

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';
import Stripe from 'stripe';
import crypto from 'crypto'; // for Coinbase Commerce signature verify
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

// ---------- ENVIRONMENT VARIABLES ----------
const {
  PORT = 8080,
  NODE_ENV = 'production',
  STABILITY_API_KEY,                // optional for video generation provider

  // ----- STRIPE -----
  STRIPE_SECRET_KEY = 'sk_test_51SSiRCDBPRGa802VZwOglJwvutBgeMKINBuGGxHHFfuyKMlIoTt8fG17AX3OXpRhbJNJYcdJscJ1qt2ANG4LVKUi00rXQL1EXv',
  STRIPE_PRICE_STARTER = 'price_your_starter_id_here',
  STRIPE_PRICE_CREATOR_MONTHLY = 'price_your_creator_id_here',
  STRIPE_PRICE_PRO_STUDIO = 'price_your_pro_id_here',
  STRIPE_WEBHOOK_SECRET = 'whsec_your_webhook_secret_here',

  // ----- PAYPAL -----
  PAYPAL_CLIENT_ID = 'your_paypal_client_id_here',
  PAYPAL_CLIENT_SECRET = 'your_paypal_secret_here',
  PAYPAL_ENV = 'sandbox', // 'sandbox' or 'live'

  // ----- COINBASE COMMERCE -----
  COINBASE_COMMERCE_API_KEY = 'your_coinbase_api_key_here',
  COINBASE_WEBHOOK_SECRET = 'your_coinbase_webhook_secret_here',

  // ----- APP -----
  PUBLIC_BASE_URL = 'https://pulsemotionhub-video-app.onrender.com'
} = process.env;

// ---------- SETUP ----------
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------- VIDEO GENERATION PLACEHOLDER ----------
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, image, imageUrl, mimeType, duration = 5 } = req.body;
    if (!prompt || (!image && !imageUrl)) {
      return res.status(400).json({ error: 'Missing prompt and image or imageUrl.' });
    }

    // TODO: Replace with actual AI generation logic (fal.ai, Kling, Stability, etc.)
    const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    return res.status(200).json({
      videoUrl,
      contentType: 'video/mp4',
      file_size: null
    });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// ---------- STRIPE CHECKOUT ----------
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function stripePriceForPlan(plan) {
  switch ((plan || '').toLowerCase()) {
    case 'starter': return STRIPE_PRICE_STARTER;
    case 'creator-monthly': return STRIPE_PRICE_CREATOR_MONTHLY;
    case 'pro-studio': return STRIPE_PRICE_PRO_STUDIO;
    default: return STRIPE_PRICE_STARTER;
  }
}

app.post('/api/checkout/stripe/session', async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured.' });
    const plan = (req.query.plan || 'starter').toLowerCase();
    const price = stripePriceForPlan(plan);
    if (!price) return res.status(400).json({ error: `Unknown plan: ${plan}` });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // or 'payment' for one-time credits
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      payment_method_types: ['card', 'link', 'cashapp'],
      success_url: `${PUBLIC_BASE_URL}/?status=success&provider=stripe`,
      cancel_url: `${PUBLIC_BASE_URL}/?status=cancel&provider=stripe`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  if (!STRIPE_WEBHOOK_SECRET || !stripe) return res.sendStatus(200);
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('✅ Stripe checkout completed:', event.data.object.id);
      break;
    case 'invoice.payment_succeeded':
      console.log('💰 Stripe invoice paid:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
  res.json({ received: true });
});

// ---------- PAYPAL CHECKOUT ----------
function paypalBase() {
  return PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

async function getPayPalAccessToken() {
  const resp = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!resp.ok) throw new Error('PayPal auth failed');
  return resp.json();
}

function planAmount(plan) {
  switch ((plan || '').toLowerCase()) {
    case 'starter': return { value: '9.99', currency: 'USD', name: 'Starter Credits' };
    case 'creator-monthly': return { value: '19.99', currency: 'USD', name: 'Creator Monthly (1 mo)' };
    case 'pro-studio': return { value: '39.99', currency: 'USD', name: 'Pro Studio' };
    default: return { value: '9.99', currency: 'USD', name: 'Starter Credits' };
  }
}

app.post('/api/checkout/paypal/create', async (req, res) => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET)
      return res.status(500).json({ error: 'PayPal not configured.' });

    const plan = (req.query.plan || 'starter').toLowerCase();
    const { value, currency, name } = planAmount(plan);
    const { access_token } = await getPayPalAccessToken();

    const order = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value }, description: name }],
        application_context: {
          brand_name: 'PulseMotionHub',
          user_action: 'PAY_NOW',
          return_url: `${PUBLIC_BASE_URL}/?status=success&provider=paypal`,
          cancel_url: `${PUBLIC_BASE_URL}/?status=cancel&provider=paypal`
        }
      })
    });

    const data = await order.json();
    if (!order.ok) return res.status(500).json({ error: 'Failed to create PayPal order.', details: data });
    const approval = (data.links || []).find(l => l.rel === 'approve');
    res.json({ orderId: data.id, approvalUrl: approval?.href });
  } catch (err) {
    console.error('PayPal error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout/paypal/capture/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { access_token } = await getPayPalAccessToken();
    const resp = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: 'Capture failed', details: data });
    res.json({ status: 'captured', data });
  } catch (e) {
    console.error('PayPal capture error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- COINBASE COMMERCE CHECKOUT ----------
app.post('/api/checkout/coinbase/charge', async (req, res) => {
  try {
    if (!COINBASE_COMMERCE_API_KEY)
      return res.status(500).json({ error: 'Coinbase Commerce not configured.' });

    const plan = (req.query.plan || 'starter').toLowerCase();
    const { value, currency, name } = planAmount(plan);

    const charge = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: `PulseMotionHub - ${name}`,
        pricing_type: 'fixed_price',
        local_price: { amount: value, currency },
        redirect_url: `${PUBLIC_BASE_URL}/?status=success&provider=coinbase`,
        cancel_url: `${PUBLIC_BASE_URL}/?status=cancel&provider=coinbase`
      })
    });

    const data = await charge.json();
    if (!charge.ok) return res.status(500).json({ error: 'Failed to create crypto charge.', details: data });
    res.json({ hosted_url: data?.data?.hosted_url, charge_code: data?.data?.code });
  } catch (err) {
    console.error('Coinbase error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhooks/coinbase', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  try {
    if (!COINBASE_WEBHOOK_SECRET) return res.sendStatus(200);
    const signature = req.headers['x-cc-webhook-signature'];
    const hmac = crypto.createHmac('sha256', COINBASE_WEBHOOK_SECRET);
    const computed = hmac.update(req.body).digest('hex');
    if (signature !== computed) {
      console.error('Coinbase signature mismatch');
      return res.sendStatus(400);
    }
    const event = JSON.parse(req.body.toString());
    console.log('Coinbase event:', event.type);
    res.json({ received: true });
  } catch (e) {
    console.error('Coinbase webhook error:', e);
    res.sendStatus(400);
  }
});

// ---------- SERVE FRONTEND ----------
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/webhooks')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  return res.status(404).json({ error: 'Not found' });
});

// ---------- START SERVER ----------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PulseMotionHub server listening on ${PORT} (${NODE_ENV})`);
});
