// api/index.js

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // Omit if using Node.js v18+
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const serverless = require('serverless-http'); // Add this line

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Session Configuration
app.use(
  session({
    secret: 'your_secret_key', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to set the API key
app.post('/set-api-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey) {
    req.session.apiKey = apiKey;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'API key is required' });
  }
});

// Endpoint to create a charge and generate a QR code
app.post('/create-charge', async (req, res) => {
  const { amount, description } = req.body;

  // Retrieve the API key from the session
  const apiKey = req.session.apiKey;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is not set' });
  }

  const url = 'https://api.commerce.coinbase.com/charges';

  const requestBody = {
    local_price: {
      amount: amount,
      currency: 'USD',
    },
    pricing_type: 'fixed_price',
    name: description || 'Charge',
    description: 'POS Charge',
    redirect_url: 'https://your-redirect-url.com', // Optional
  };

  const payload = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CC-Api-Key': apiKey, // Use the user's API key
    },
    body: JSON.stringify(requestBody),
  };

  try {
    const response = await fetch(url, payload);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const chargeUrl = data.data.hosted_url;

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(chargeUrl);

    res.json({ qrCodeData });
  } catch (error) {
    console.error('Error creating charge:', error);
    res.status(500).json({ error: 'Failed to create charge' });
  }
});

// Start the server (omit this when deploying to Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.handler = serverless(app); // Add this line