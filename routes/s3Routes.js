const express = require('express');
const authenticate = require("../middleware/auth");
const { deleteProfilePic, uploadProfilePic, getProfilePic } = require("../controllers/ImageController");

const routes = express.Router();

routes.get('/ping', (req, res) => {
    console.info("OK!");
    res.status(200).json({ message: "OK!" });
});

routes.post('/self/pic', authenticate, uploadProfilePic);
//routes.get('/self/pic', authenticate, getProfilePic);
routes.delete('/files/:filename', deleteProfilePic);

routes.use((req, res) => {
    const error = new Error('Not found!');
    console.error(error);
    return res.status(404).json({ message: error.message });
});

module.exports = routes;
