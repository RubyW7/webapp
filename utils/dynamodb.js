const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const uuid = require("uuid");

class DynamoDbProvider {
  constructor(dynamoDbRegion, dynamoDbTableName) {
    this.dynamoDbRegion = dynamoDbRegion;
    this.dynamoDbTableName = dynamoDbTableName;
    this.dynamoDb = new DynamoDB({
      region: this.dynamoDbRegion,
    });
  }

  async addUserToken(userName) {
    // create user token
    let userToken = uuid.v4();
    // add user token to dynamo db

    // find epoch time of 300 seconds from now
    let epochTime = new Date().getTime() / 1000 + 300;

    let params = {
      TableName: this.dynamoDbTableName,
      Item: {
        username: {
          S: userName,
        },
        usertoken: {
          S: userToken,
        },
        tokenttl: {
          N: epochTime.toString(),
        },
      },
    };
    await this.dynamoDb.putItem(params);
    return userToken;
  }

  async verifyUserToken(userName, userToken) {
    // get user token from dynamo db
    // exclude expired tokens
    let params = {
      TableName: this.dynamoDbTableName,
      Key: {
        username: {
          S: userName,
        },
      },
    };

    let data = await this.dynamoDb.getItem(params);
    if (data.Item && data.Item.usertoken && data.Item.tokenttl) {
      let userTokenFromDb = data.Item.usertoken.S;
      let tokenTTL = data.Item.tokenttl.N;
      let currentTime = new Date().getTime() / 1000;
      if (userTokenFromDb === userToken && currentTime < tokenTTL) {
        return true;
      }
    }
    return false;
  }
}

module.exports = DynamoDbProvider;
