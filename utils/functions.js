const { PutObjectCommand, S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { parseUrl } = require("@smithy/url-parser");
const { formatUrl } = require("@aws-sdk/util-format-url");
const { Hash } = require("@smithy/hash-node");
const { HttpRequest } = require("@smithy/protocol-http");

const config = require("../config/s3Config");

const uploadToS3 = async (file, bucketName) => {
    try {
        const client = new S3Client({
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.access_key,
                secretAccessKey: config.aws.secret_key
            }
        });

        const newFileName = `pic_${Date.now().toString()}.${file.mimetype.split('/')[1]}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: newFileName,
            Body: file.data
        });

        return await client.send(command);
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
                secretAccessKey: config.aws.secret_key
            }
        });

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: filename
        });

        return await client.send(command);
    } catch (e) {
        return e;
    }
};

const generatePresignedURL = async (filename, bucketName) => {
    try {
        const url = parseUrl(`https://${bucketName}.s3.${config.aws.region}.amazonaws.com/${filename}`);

        const s3Presigner = new S3RequestPresigner({
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.access_key,
                secretAccessKey: config.aws.secret_key
            },
            sha256: Hash.bind(null, "sha256")
        });

        const presignedUrlObj = await s3Presigner.presign(new HttpRequest({
            ...url, method: "GET"
        }));

        return formatUrl(presignedUrlObj);
    } catch (e) {
        return e;
    }
};

module.exports = { uploadToS3, deleteFromS3, generatePresignedURL };
