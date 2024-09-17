// public/script.js

// Variables
let amountInput = '';
let isGenerating = false;
let apiKey = '';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeyButton = document.getElementById('api-key-button');

const menuIcon = document.getElementById('menu-icon');
const dropdownMenu = document.getElementById('dropdown-menu');
const logoutButton = document.getElementById('logout-button');

const totalAmountEl = document.getElementById('total-amount'); // For desktop
const totalAmountMobileEl = document.getElementById('total-amount-mobile'); // For mobile
const descriptionGroup = document.getElementById('description-group');
const descriptionInput = document.getElementById('description');
const keypad = document.getElementById('keypad');
const keys = document.querySelectorAll('.key'); // Excludes the delete key
const deleteKey = document.getElementById('delete-key');
const actionButton = document.getElementById('action-button');
const qrCodeDiv = document.getElementById('qr-code');
const orderTitle = document.getElementById('order-title'); // Added reference to the order title

// Check for stored API key in localStorage
if (localStorage.getItem('apiKey')) {
  apiKey = localStorage.getItem('apiKey');
  // Hide login screen and show main app
  loginScreen.style.display = 'none';
  mainApp.style.display = 'flex';
} else {
  // Show login screen
  loginScreen.style.display = 'flex';
  mainApp.style.display = 'none';
}

// Event listener for API key submission
apiKeyButton.addEventListener('click', () => {
  apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert('Please enter your API key.');
    return;
  }

  // Store API key in localStorage
  localStorage.setItem('apiKey', apiKey);

  // Hide login screen and show main app
  loginScreen.style.display = 'none';
  mainApp.style.display = 'flex';
});

// Event listener for menu icon
menuIcon.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent event from bubbling up
  // Toggle the display of the dropdown menu
  if (dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '') {
    dropdownMenu.style.display = 'block';
  } else {
    dropdownMenu.style.display = 'none';
  }
});

// Event listener for logout button
logoutButton.addEventListener('click', () => {
  // Clear the API key from localStorage
  localStorage.removeItem('apiKey');
  apiKey = '';

  // Reset the app state
  amountInput = '';
  isGenerating = false;
  updateTotalDisplay();
  actionButton.textContent = 'Continue';
  descriptionGroup.style.display = 'block';
  keypad.style.display = 'block';
  qrCodeDiv.style.display = 'none';
  qrCodeDiv.innerHTML = '';

  // Reset the order title
  orderTitle.textContent = 'Enter Order Total';

  // Clear description input
  descriptionInput.value = '';

  // Hide dropdown menu
  dropdownMenu.style.display = 'none';

  // Show login screen and hide main app
  loginScreen.style.display = 'flex';
  mainApp.style.display = 'none';
});

// Close the dropdown menu when clicking outside of it
document.addEventListener('click', function(event) {
  if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// Keypad event listeners
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

// Action button event listener
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

    // Reset the order title
    orderTitle.textContent = 'Enter Order Total';

  } else {
    if (!amountInput) {
      alert('Please enter an amount.');
      return;
    }
    isGenerating = true;
    actionButton.textContent = 'New Order';
    descriptionGroup.style.display = 'none';
    keypad.style.display = 'none';

    const description = descriptionInput.value;

    // Create the charge
    try {
      const data = await createCharge(amountInput, description);

      if (data.qrCodeData) {
        // Update the order title
        orderTitle.textContent = 'Scan Here to Pay';

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
        // Reset the order title
        orderTitle.textContent = 'Enter Order Total';
      }
    } catch (error) {
      alert(error.message);
      isGenerating = false;
      actionButton.textContent = 'Continue';
      descriptionGroup.style.display = 'block';
      keypad.style.display = 'block';
      qrCodeDiv.style.display = 'none';
      qrCodeDiv.innerHTML = '';
      // Reset the order title
      orderTitle.textContent = 'Enter Order Total';
    }
  }
});

// Function to create charge
// Function to create charge
async function createCharge(amountInput, description) {
  const response = await fetch('/api/create-charge', { // Updated path
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountInput, description, apiKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create charge');
  }

  return data;
}


// Function to update the total display
function updateTotalDisplay() {
  const formattedAmount = amountInput ? `$${formatAmount(amountInput)}` : '$0.00';

  // Update desktop total amount
  if (totalAmountEl) {
    totalAmountEl.textContent = formattedAmount;
  }

  // Update mobile total amount
  if (totalAmountMobileEl) {
    totalAmountMobileEl.textContent = formattedAmount;
  }
}

// Function to format the amount
function formatAmount(amount) {
  const [dollars, cents] = amount.split('.');
  const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (cents !== undefined) {
    return `${formattedDollars}.${cents}`;
  }
  return formattedDollars;
}
