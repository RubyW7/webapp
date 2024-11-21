const AWS = require("aws-sdk");

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const logger = require("../utils/logger");

class SnsProvider {
  constructor(topicArn, region) {
    this.topicArn = topicArn;
    this.region = region;
    // JS SDK v3 does not support global configuration.
    // Codemod has attempted to pass values to each service client in this file.
    // You may need to update clients outside of this file, if they use global config.
    AWS.config.update({ region: region });
    this.sns = new SNSClient({
      region: this.region,
    });
  }

  async publishMessage(message) {
    const params = {
      Message: message,
      TopicArn: this.topicArn,
    };

    try {
      const publishCommand = new PublishCommand(params);
      const snsData = await SNSClient.send(publishCommand);
      console.log(snsData);
      logger.info(
        `Message ${params.Message} sent to the topic ${params.TopicArn} with id ${messageData.MessageId}`
      );
    } catch (err) {
      console.log(err.message);
    }
  }
}

module.exports = SnsProvider;