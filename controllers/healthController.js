const sequelize = require("../config/db");
const logger = require("../utils/logger");  // Make sure to configure this path correctly
const statsDClient = require("../utils/metrics");  // Make sure to configure this path correctly

const healthCheck = async (req, res) => {
  const start = process.hrtime.bigint();  // Start timing here
  statsDClient.increment("endpoint.healthCheck.hit");
  logger.info("Entering healthCheck method");

  if (Object.keys(req.query).length > 0) {
    logger.warn("HealthCheck called with invalid query parameters");
    statsDClient.increment("endpoint.healthCheck.fail.queryParameters");
    return res.status(400).send({ error: "Invalid query parameters" });
  }

  if (req.body && Object.keys(req.body).length > 0) {
    logger.warn("HealthCheck called with invalid body parameters");
    statsDClient.increment("endpoint.healthCheck.fail.bodyParameters");
    return res.status(400).send({ error: "Invalid body parameters" });
  }

  try {
    await sequelize.authenticate();
    const duration = process.hrtime.bigint() - start;  // Calculate duration
    statsDClient.timing("endpoint.healthCheck.duration", Number(duration / 1000000n));  // Log the duration in milliseconds
    logger.info("Database connection verified successfully");
    statsDClient.increment("endpoint.healthCheck.success");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send();
  } catch (error) {
    const duration = process.hrtime.bigint() - start;
    statsDClient.timing("endpoint.healthCheck.duration", Number(duration / 1000000n));
    logger.error("Connection error during health check", error);
    statsDClient.increment("endpoint.healthCheck.failure");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(503).send();
  }
};

module.exports = { healthCheck };
