const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({
      filename: "/opt/csye6225/webapp/logs/webapp.log",
    }), // Log errors to a file
  ],
});

module.exports = logger;
