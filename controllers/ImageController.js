const { deleteFromS3, generatePresignedURL, uploadToS3 } = require("../utils/functions");
const s3Config = require("../config/s3Config");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const User = require('../models/user');

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

            // upldate user.profile_image
            user.profile_image = req.files.profilePic.name;
            await user.save(); 

            const responseBody = {
                file_name: req.files.profilePic.name,
                id: uuidv4(),
                url: result.Location,
                upload_date: moment().format("YYYY-MM-DD"),
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

