const DynamoDbProvider = require('../utils/dynamodb'); 
const awsConfig = require("../config/config").AWS_CONFIG;
const awsSnsProvider = require("../utils/snsProvider");
const logger = require("../utils/logger");

logger.info("Creating dynamoDb provider");
const dynamoDb = new DynamoDbProvider(
    awsConfig.AWS_REGION,
    awsConfig.DYNAMO_DB_TABLE_NAME
);

logger.info("Creating AWS SNS provider");
const sns = new awsSnsProvider(
  awsConfig.SNS_TOPIC_ARN,
  awsConfig.AWS_REGION,
);

module.exports = { dynamoDb, sns };