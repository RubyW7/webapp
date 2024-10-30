const { deleteFromS3, generatePresignedURL, uploadToS3 } = require("../utils/functions");
const s3Config = require("../config/s3Config");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const User = require('../models/user');

const generateFileUrl = (userId, filename) => {
    return `${s3Config.aws.bucket}/${userId}/${filename}`;
};

exports.uploadProfilePic = async (req, res) => {
    try {
        if (req.files && req.files.profilePic) {
            const userId = req.user.id;
            const user = await User.findByPk(userId);

            // check if profile image already existed
            console.log("Current profile_image:", user.profile_image);
            if (user.profile_image) {
                console.log("User already has a profile picture.");
                return res.status(400).json({
                    message: "Profile picture already exists. Please delete it before uploading a new one."
                });
            }

            // upload to S3
            const result = await uploadToS3(req.files.profilePic, s3Config.aws.bucket);
            if (!result ) {
                console.log("Failed to upload image to S3.");
                return res.status(500).json({
                    message: "Failed to upload image to S3."
                });
            }
            const upload_date = moment().format("YYYY-MM-DD");

            // upldate user.profile_image
            user.profile_image = req.files.profilePic.name;
            user.upload_date = upload_date;
            await user.save(); 

            const url = generateFileUrl(userId, user.profile_image);

            const responseBody = {
                file_name: req.files.profilePic.name,
                id: uuidv4(),
                url: url,
                upload_date: upload_date,
                user_id: userId,
            };

            return res.status(201).json({
                message: "Success",
                body: responseBody
            });
        } else {
            console.log("No profile picture file found in the request.");
            return res.status(400).json({
                message: "Bad Request",
                error: "No profile picture file found in the request"
            });
        }
    } catch (e) {
        console.log("Error in uploadProfilePic:", e);
        return res.status(500).json({
            message: "Something went wrong!"
        });
    }
};

exports.getProfilePic = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user.profile_image) {
            return res.status(404).json({ message: "Profile picture not found." });
        }

        const url = generateFileUrl(userId, user.profile_image);

        const responseBody = {
            file_name: user.profile_image,
            id: user.id,
            url: url,
            upload_date: moment(user.upload_date).format("YYYY-MM-DD"),
            user_id: user.id,
        };

        return res.status(200).json(responseBody);
    } catch (error) {
        console.error("Error in getProfilePic:", error);
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

exports.deleteProfilePic = async (req, res) => {
    try {
        if (req.params.filename) {
            // Delete file
            const result = await deleteFromS3(req.params.filename, s3Config.aws.bucket);
            return res.status(200).json({
                message: "Success",
                body: result
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong!"
        });
    }
};

