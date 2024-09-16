// public/script.js

let amountInput = '';
let isGenerating = false;
let apiKey = ''; // Store the API key here

// Existing variables and functions remain the same

// Variables for API Key Handling
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeyButton = document.getElementById('api-key-button');

apiKeyButton.addEventListener('click', () => {
  apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert('Please enter your API key.');
    return;
  }

  // Hide the login screen and show the main app
  loginScreen.style.display = 'none';
  mainApp.style.display = 'flex';
});

// Update the createCharge function to include the API key
async function createCharge(amountInput, description) {
  const response = await fetch('/create-charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountInput, description, apiKey }), // Include the API key
  });

  return await response.json();
}

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

    // Create the charge using the function
    const data = await createCharge(amountInput, description);

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
