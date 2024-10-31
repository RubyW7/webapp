const {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const config = require("../config/s3Config");

const uploadToS3 = async (file, bucketName) => {
  try {
    const client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.access_key,
        secretAccessKey: config.aws.secret_key,
      },
    });

    const newFileName = `pic_${Date.now().toString()}.${file.mimetype.split("/")[1]}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: newFileName,
      Body: file.data,
    });

    const result = await client.send(command);

    return { filename: newFileName, result };
  } catch (e) {
    return e;
  }
};

const deleteFromS3 = async (filename, bucketName) => {
  try {
    const client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.access_key,
        secretAccessKey: config.aws.secret_key,
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    return await client.send(command);
  } catch (e) {
    return e;
  }
};

module.exports = { uploadToS3, deleteFromS3 };
