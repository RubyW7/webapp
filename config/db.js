const { Sequelize } = require("sequelize");
const statsDClient = require("../utils/metrics");

//use sequelize to connect database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    hooks: {
      beforeQuery: (query, options) => {
        options._queryStartTime = process.hrtime.bigint();
      },
      afterQuery: (query, options) => {
        const duration =
          (process.hrtime.bigint() - options._queryStartTime) / BigInt(1000000); // 将纳秒转换为毫秒
        console.log(`Query executed in ${duration}ms`);
        statsDClient.timing("database.query.duration", Number(duration)); // 发送时间到 StatsD
      },
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

module.exports = sequelize;
