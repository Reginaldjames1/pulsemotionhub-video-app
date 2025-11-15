// server.js
// PulseMotionHub backend: Stripe + PayPal checkout

require('dotenv').config(); // Local dev .env (Render uses dashboard env vars)

const express = require('express');
const path = require('path');
const Stripe = require('stripe');

const app = express();

// ------------------ ENVIRONMENT VARIABLES ------------------

const {
  PORT = 10000,                 // Render detects the port anyway; 10000 is fine
  NODE_ENV = 'production',

  // ----- STRIPE -----
  STRIPE_SECRET_KEY,

  // Price IDs
  STRIPE_PRICE_STARTER,          // one-time Starter Credits
  STRIPE_PRICE_STARTER_CREDITS,  // optional newer name
  STRIPE_PRICE_CREATOR_MONTHLY,  // recurring
  STRIPE_PRICE_PRO_STUDIO,       // recurring

  // Optional: Stripe webhook (not used yet)
  STRIPE_WEBHOOK_SECRET,

  // ----- PAYPAL -----
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV = 'sandbox', // 'sandbox' or 'live'

  // Optional: app base URL override (otherwise we derive from request)
  APP_BASE_URL
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not set. Stripe checkout will fail.');
}

const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

// Resolve starter price from either env name
const STARTER_PRICE_ID = STRIPE_PRICE_STARTER_CREDITS || STRIPE_PRICE_STARTER;
console.log('Stripe starter price (resolved):', STARTER_PRICE_ID);

// ------------------ BASIC APP SETUP ------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your front-end) from /public
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

// Helper to compute base URL (works locally + on Render)
function getBaseUrl(req) {
  if (APP_BASE_URL) return APP_BASE_URL;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return `${proto}://${req.get('host')}`;
}

// ------------------ STRIPE PLANS CONFIG ------------------

const STRIPE_PLANS = {
  starter: {
    name: 'Starter Credits',
    mode: 'payment',                    // 🔒 FORCE ONE-TIME
    get priceId() {
      return STARTER_PRICE_ID;
    },
    priceEnvKey: () =>
      STARTER_PRICE_ID
        ? (STRIPE_PRICE_STARTER_CREDITS
            ? 'STRIPE_PRICE_STARTER_CREDITS'
            : 'STRIPE_PRICE_STARTER')
        : 'STRIPE_PRICE_STARTER'
  },

  'creator-monthly': {
    name: 'Creator Monthly',
    mode: 'subscription',               // 🔒 FORCE SUBSCRIPTION
    get priceId() {
      return STRIPE_PRICE_CREATOR_MONTHLY;
    },
    priceEnvKey: () => 'STRIPE_PRICE_CREATOR_MONTHLY'
  },

  'pro-studio': {
    name: 'Pro Studio',
    mode: 'subscription',               // 🔒 FORCE SUBSCRIPTION
    get priceId() {
      return STRIPE_PRICE_PRO_STUDIO;
    },
    priceEnvKey: () => 'STRIPE_PRICE_PRO_STUDIO'
  }
};

// ------------------ STRIPE CHECKOUT SESSION ------------------

app.post('/api/checkout/stripe/session', async (req, res) => {
  try {
    const plan = (req.query.plan || req.body.plan || '').toLowerCase();

    console.log('Stripe checkout requested for plan:', plan);

    const config = STRIPE_PLANS[plan];
    if (!config) {
      console.error('❌ Unknown Stripe plan:', plan);
      return res.status(400).json({ error: 'Unknown plan' });
    }

    const priceId = config.priceId;
    if (!priceId) {
      const keyName = config.priceEnvKey();
      console.error(
        `❌ Missing price ID for plan "${plan}". Check env var ${keyName}`
      );
      return res.status(500).json({
        error: `Server misconfigured for plan "${plan}". Missing ${keyName}.`
      });
    }

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const mode = config.mode; // strictly from STRIPE_PLANS

    const baseUrl = getBaseUrl(req);

    const sessionParams = {
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // Explicitly disable automatic tax to avoid "valid origin address" errors
      automatic_tax: { enabled: false },
      success_url: `${baseUrl}/pricing?status=success&plan=${encodeURIComponent(
        plan
      )}`,
      cancel_url: `${baseUrl}/pricing?status=cancel&plan=${encodeURIComponent(
        plan
      )}`,
      metadata: {
        plan,
        source: 'pulsemotionhub'
      }
    };

    console.log(
      'Creating Stripe session with params:',
      JSON.stringify(
        { mode: sessionParams.mode, line_items: sessionParams.line_items },
        null,
        2
      )
    );

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(
      '✅ Stripe session created:',
      session.id,
      'for plan:',
      plan,
      'mode:',
      mode
    );

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error(
      '❌ Stripe session error:',
      err.type || '',
      err.message
    );
    res.status(500).json({
      error: 'Stripe checkout failed',
      details: err.message
    });
  }
});

// ------------------ PAYPAL HELPERS ------------------

// Node 18+ has global fetch; if not, you could import 'node-fetch'
async function getPayPalAccessToken() {
  const base =
    PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal token error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, baseUrl: base };
}

// ------------------ PAYPAL CHECKOUT (CREDITS / PLANS) ------------------

app.post('/api/checkout/paypal/create-order', async (req, res) => {
  try {
    const { plan } = req.body;

    console.log('PayPal/crypto checkout requested for plan:', plan);

    const config = STRIPE_PLANS[plan]; // reuse names for consistency
    if (!config) {
      return res.status(400).json({ error: 'Unknown plan' });
    }

    // For now we just hard-code amounts matching your Stripe prices
    let value = '9.99';
    if (plan === 'creator-monthly') value = '19.99';
    if (plan === 'pro-studio') value = '39.99';

    const { accessToken, baseUrl } = await getPayPalAccessToken();

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value
            },
            custom_id: plan
          }
        ],
        application_context: {
          brand_name: 'PulseMotionHub',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${getBaseUrl(
            req
          )}/pricing?status=success&provider=paypal&plan=${encodeURIComponent(
            plan
          )}`,
          cancel_url: `${getBaseUrl(
            req
          )}/pricing?status=cancel&provider=paypal&plan=${encodeURIComponent(
            plan
          )}`
        }
      })
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      throw new Error(`PayPal order error: ${orderRes.status} ${text}`);
    }

    const order = await orderRes.json();
    console.log('✅ PayPal order created:', order.id, 'for plan:', plan);

    res.json(order);
  } catch (err) {
    console.error('❌ PayPal create-order error:', err.message);
    res.status(500).json({
      error: 'PayPal checkout failed',
      details: err.message
    });
  }
});

// Capture PayPal order
app.post('/api/checkout/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    const { accessToken, baseUrl } = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!captureRes.ok) {
      const text = await captureRes.text();
      throw new Error(`PayPal capture error: ${captureRes.status} ${text}`);
    }

    const data = await captureRes.json();
    console.log('✅ PayPal order captured:', orderId);
    res.json(data);
  } catch (err) {
    console.error('❌ PayPal capture-order error:', err.message);
    res.status(500).json({
      error: 'PayPal capture failed',
      details: err.message
    });
  }
});

// ------------------ CATCH-ALL: FRONTEND ------------------

// If you use a single-page app front-end:
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------ START SERVER ------------------

app.listen(PORT, () => {
  console.log(`✅ PulseMotionHub server listening on ${PORT} (${NODE_ENV})`);
});
