// ============================================
// GLOBAL CONFIGURATION
// ============================================
// Change this IP address when you connect to a new network
// Find your IP by running 'ipconfig' in terminal (Windows)
// or 'ifconfig' on Mac/Linux

const SERVER_IP = '192.168.8.119';
const SERVER_PORT = '5000';

export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Sx2Y6FZqoHJ06r7unPBIdEnx6SwvjRP8IHULVVNFeSihgPF618N4gfAXP1JPFSBIGBxxvDpIeEQ5ayeo6pMcyE800IPcAYUrT';

export default { API_BASE_URL, SERVER_IP, SERVER_PORT, STRIPE_PUBLISHABLE_KEY };
