const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// This is the middleware function
function logger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;
  const timestamp = new Date().toISOString();

  // Log to console
  console.log(`[${timestamp}] ${method} ${url} - ${ip || req.connection.remoteAddress}`);

  // Log to file
  const logEntry = `${timestamp} ${method} ${url} ${ip || req.connection.remoteAddress} - ${req.headers['user-agent'] || 'Unknown'}\n`;
  fs.appendFile(path.join(logDir, 'access.log'), logEntry, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });

  // Log response time when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logLine = `[${timestamp}] ${method} ${url} ${statusCode} - ${duration}ms\n`;
    
    // Only log API requests to a separate file
    if (url.startsWith('/api')) {
      fs.appendFile(path.join(logDir, 'api.log'), logLine, (err) => {
        if (err) console.error('Error writing to API log file:', err);
      });
    }
  });

  next();
}

// Export the middleware function directly
module.exports = logger;