const { deleteFromS3, uploadToS3 } = require("../utils/functions");
const s3Config = require("../config/s3Config");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const User = require('../models/user');
const logger = require('../utils/logger');
const statsDClient = require('../utils/metrics');

const generateFileUrl = (userId, filename) => {
    return `${s3Config.aws.bucket}/${userId}/${filename}`;
};

exports.uploadProfilePic = async (req, res) => {
    statsDClient.increment('endpoint.uploadProfilePic.hit');
    logger.info('Entering uploadProfilePic method');
    
    try {
        if (req.files && req.files.profilePic) {
            const userId = req.user.id;
            const user = await User.findByPk(userId);
            logger.info(`Current profile_image for user ${userId}: ${user.profile_image}`);

            if (user.profile_image) {
                logger.warn(`User ${userId} already has a profile picture.`);
                return res.status(400).json({
                    message: "Profile picture already exists. Please delete it before uploading a new one."
                });
            }

            const result = await uploadToS3(req.files.profilePic, s3Config.aws.bucket);
            if (!result) {
                logger.error(`Failed to upload image to S3 for user ${userId}.`);
                statsDClient.increment('endpoint.uploadProfilePic.fail.s3Upload');
                return res.status(500).json({
                    message: "Failed to upload image to S3."
                });
            }

            user.profile_image = result.filename;
            user.upload_date = moment().format("YYYY-MM-DD");
            await user.save(); 

            const url = generateFileUrl(userId, user.profile_image);

            const responseBody = {
                file_name: req.files.profilePic.name,
                id: uuidv4(),
                url: url,
                upload_date: user.upload_date,
                user_id: userId,
            };

            statsDClient.increment('endpoint.uploadProfilePic.success');
            return res.status(201).json({
                message: "Success",
                body: responseBody
            });
        } else {
            logger.warn("No profile picture file found in the request.");
            return res.status(400).json({
                message: "Bad Request",
                error: "No profile picture file found in the request"
            });
        }
    } catch (e) {
        logger.error(`Error in uploadProfilePic: ${e}`);
        statsDClient.increment('endpoint.uploadProfilePic.error');
        return res.status(500).json({
            message: "Something went wrong!"
        });
    }
};

exports.getProfilePic = async (req, res) => {
    // Increment the hit counter for this endpoint
    statsDClient.increment('endpoint.getProfilePic.hit');
    logger.info('Entering getProfilePic method');

    try {
        const userId = req.user.id;
        logger.debug(`Fetching profile picture for user ID: ${userId}`);

        const user = await User.findByPk(userId);

        if (!user.profile_image) {
            logger.warn(`Profile picture not found for user ID: ${userId}`);
            statsDClient.increment('endpoint.getProfilePic.notFound');
            return res.status(404).json({ message: "Profile picture not found." });
        }

        const url = generateFileUrl(userId, user.profile_image);
        const uploadDateFormatted = moment(user.upload_date).format("YYYY-MM-DD");

        const responseBody = {
            file_name: user.profile_image,
            id: user.id,
            url: url,
            upload_date: uploadDateFormatted,
            user_id: user.id,
        };

        // Successful retrieval of profile picture
        statsDClient.increment('endpoint.getProfilePic.success');
        logger.info(`Profile picture retrieved successfully for user ID: ${userId}`);
        return res.status(200).json(responseBody);
    } catch (error) {
        logger.error(`Error in getProfilePic for user ID: ${req.user.id}: ${error}`);
        statsDClient.increment('endpoint.getProfilePic.failure');
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

exports.deleteProfilePic = async (req, res) => {
    // Increment the hit counter for this endpoint
    statsDClient.increment('endpoint.deleteProfilePic.hit');
    logger.info('Entering deleteProfilePic method');

    try {
        const userId = req.user.id;
        logger.debug(`Attempting to delete profile picture for user ID: ${userId}`);

        const user = await User.findByPk(userId);

        if (!user.profile_image) {
            logger.warn(`Profile picture not found for user ID: ${userId}`);
            statsDClient.increment('endpoint.deleteProfilePic.notFound');
            return res.status(404).json({ message: "Profile picture not found." });
        }

        const filename = user.profile_image;
        await deleteFromS3(filename, s3Config.aws.bucket);
        logger.info(`Profile picture ${filename} deleted from S3 for user ID: ${userId}`);

        user.profile_image = null;
        user.upload_date = null; 
        await user.save();

        // Successfully deleted the profile picture
        statsDClient.increment('endpoint.deleteProfilePic.success');
        logger.info(`Profile picture data removed from database for user ID: ${userId}`);
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error in deleteProfilePic for user ID: ${req.user.id}: ${error}`);
        statsDClient.increment('endpoint.deleteProfilePic.failure');
        return res.status(500).json({ message: "Something went wrong!" });
    }
};
