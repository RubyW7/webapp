const StatsD = require("node-statsd");

const client = new StatsD({
  prefix: "webapp",
  host: process.env.HOST || "localhost",
  port: 8125,
});

module.exports = client;
