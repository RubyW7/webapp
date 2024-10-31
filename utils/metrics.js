const StatsD = require('node-statsd');

const client = new StatsD({
    prefix: 'webapp',
    host: 'localhost',
    port: 8125,
});

module.exports = client;
