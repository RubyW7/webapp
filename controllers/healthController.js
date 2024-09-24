const pool = require('../config/db');

const healthCheck = async (req, res) => {
    if (req.body && Object.keys(req.body).length > 0) {
        return res.status(400).send();
    }

    try {
        await pool.query('SELECT NOW()');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send();
    } catch (error) {
        console.error('Connection error:', error);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(503).send(); 
    }
};

module.exports = { healthCheck };
