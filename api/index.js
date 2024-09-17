// api/index.js

const fetch = require('node-fetch');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/create-charge') {
    let body = '';

    // Collect the data from the request
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const { amount, description, apiKey } = JSON.parse(body);

      if (!apiKey) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API key is required' }));
        return;
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

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ qrCodeData }));
      } catch (error) {
        console.error('Error creating charge:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to create charge' }));
      }
    });
  } else {
    // Handle other routes or methods
    res.statusCode = 404;
    res.end('Not Found');
  }
};
