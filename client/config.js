// ============================================
// GLOBAL CONFIGURATION
// ============================================
// Change this IP address when you connect to a new network
// Find your IP by running 'ipconfig' in terminal (Windows)
// or 'ifconfig' on Mac/Linux

const SERVER_IP = '10.31.26.193';
const SERVER_PORT = '5000';

export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

export default { API_BASE_URL, SERVER_IP, SERVER_PORT };
