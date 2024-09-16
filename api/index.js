// api/index.js

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // Omit if using Node.js v18+
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
//app.get('/', (req, res) => {
  //res.sendFile(path.join(__dirname, 'public', 'index.html'));
//});

// Endpoint to create a charge and generate a QR code
app.post('/create-charge', async (req, res) => {
  const { amount, description, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
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
   // redirect_url: 'https://your-redirect-url.com', // Optional
  };

  const payload = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CC-Api-Key': apiKey, // Use the API key from the request body
    },
    body: JSON.stringify(requestBody),
  };

  try {
    const response = await fetch(url, payload);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error || 'Unknown error'}`);
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

module.exports = app; // Export the app for Vercel
