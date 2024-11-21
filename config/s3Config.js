const dotenv = require("dotenv");

dotenv.config();

const s3Config = {
  aws: {
    bucket: process.env.AWS_S3_BUCKET || "",
    region: process.env.AWS_REGION || "",
  },
};

module.exports = s3Config;
