// public/script.js

let amountInput = '';
let isGenerating = false;

const totalAmountEl = document.getElementById('total-amount');
const keypad = document.getElementById('keypad');
const keys = document.querySelectorAll('.key'); // Excludes the delete key
const deleteKey = document.getElementById('delete-key');
const actionButton = document.getElementById('action-button');
const qrCodeDiv = document.getElementById('qr-code');
const descriptionGroup = document.getElementById('description-group');

// New Variables for API Key Handling
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeyButton = document.getElementById('api-key-button');

apiKeyButton.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert('Please enter your API key.');
    return;
  }

  // Send the API key to the server
  const response = await fetch('/set-api-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });

  const data = await response.json();

  if (data.success) {
    // Hide the login screen and show the main app
    loginScreen.style.display = 'none';
    mainApp.style.display = 'flex';
  } else {
    alert('Failed to set API key.');
  }
});

keys.forEach(key => {
  key.addEventListener('click', () => {
    if (isGenerating) return;

    const value = key.getAttribute('data-value');

    if (value === '.' && amountInput.includes('.')) return;

    amountInput += value;
    updateTotalDisplay();
  });
});

deleteKey.addEventListener('click', () => {
  if (isGenerating) return;

  amountInput = amountInput.slice(0, -1);
  updateTotalDisplay();
});

// Update the action button event listener
actionButton.addEventListener('click', async () => {
    if (isGenerating) {
      // Reset the page
      amountInput = '';
      isGenerating = false;
      updateTotalDisplay();
      actionButton.textContent = 'Continue';
      descriptionGroup.style.display = 'block';
      keypad.style.display = 'block';
      qrCodeDiv.style.display = 'none';
      qrCodeDiv.innerHTML = '';
    } else {
      if (!amountInput) {
        alert('Please enter an amount.');
        return;
      }
      isGenerating = true;
      actionButton.textContent = 'New Order';
      descriptionGroup.style.display = 'none';
      keypad.style.display = 'none';
  
      const description = document.getElementById('description').value;
  

    // Send the amount and description to the server to generate the QR code
    async function createCharge(amountInput, description) {
        const response = await fetch('/create-charge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include credentials in the request
          body: JSON.stringify({ amount: amountInput, description }),
        });
      
        return await response.json();
      }
      

    const data = await response.json();

    if (data.qrCodeData) {
        // Create image element dynamically after QR code data is received
        const qrCodeImg = document.createElement('img');
        qrCodeImg.src = data.qrCodeData;
        qrCodeImg.alt = 'QR Code';
        qrCodeImg.style.width = '220px';
        qrCodeImg.style.height = '220px';
        qrCodeImg.style.borderRadius = '20px';
        qrCodeImg.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        qrCodeImg.style.display = 'block';
        qrCodeImg.style.margin = '0 auto';
  
        qrCodeImg.onload = function() {
          // Show the QR code div after the image has loaded
          qrCodeDiv.style.display = 'block';
        };
  
        // Add the image to the QR code div
        qrCodeDiv.appendChild(qrCodeImg);
      } else {
        alert('Failed to generate QR code.');
        isGenerating = false;
        actionButton.textContent = 'Continue';
        descriptionGroup.style.display = 'block';
        keypad.style.display = 'block';
        qrCodeDiv.style.display = 'none';
        qrCodeDiv.innerHTML = '';
      }
    }
  });

function updateTotalDisplay() {
  if (!amountInput) {
    totalAmountEl.textContent = '$0.00';
  } else {
    totalAmountEl.textContent = `$${formatAmount(amountInput)}`;
  }
}

function formatAmount(amount) {
  const [dollars, cents] = amount.split('.');
  const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (cents !== undefined) {
    return `${formattedDollars}.${cents}`;
  }
  return formattedDollars;
}
