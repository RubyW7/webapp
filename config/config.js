require("dotenv").config();

module.exports = {
  
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "postgres",
  port: process.env.DB_PORT,
  
  AWS_CONFIG: {
    DYNAMO_DB_TABLE_NAME: process.env.DYNAMO_DB_TABLE_NAME,
    SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN,
  },
};
