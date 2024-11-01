const {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const statsDClient = require("../utils/metrics"); 

const config = require("../config/s3Config");

const uploadToS3 = async (file, bucketName) => {
  const start = process.hrtime();
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
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = (seconds * 1000) + (nanoseconds / 1000000);
    statsDClient.timing('s3.upload.duration', duration);

    return { filename: newFileName, result };
  } catch (e) {
    return e;
  }
};

const deleteFromS3 = async (filename, bucketName) => {
  const start = process.hrtime();
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

    const result = await client.send(command);
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = (seconds * 1000) + (nanoseconds / 1000000);
    statsDClient.timing('s3.delete.duration', duration);

    return result;
  } catch (e) {
    return e;
  }
};

module.exports = { uploadToS3, deleteFromS3 };
