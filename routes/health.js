const express = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

router.get('/', healthCheck);

router.all('/', (req, res) => {
    return res.status(405).send(); 
});

module.exports = router;
