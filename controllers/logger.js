const fs = require('fs');
const path = require('path');

// Create a logs folder if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir);
// }

// Simple logging function`
function saveLog(username, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(path.join(logsDir, `${username}.txt`), logMessage);
  } catch (err) {
    console.error('Failed to write log entry:', err.message);
  }
  // Append to log file
}

module.exports = saveLog;