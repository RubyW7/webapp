const sequelize = require('../config/db');

const healthCheck = async (req, res) => {
    // Check if there are no query parameters
    if (Object.keys(req.query).length === 0) {
        if (req.body && Object.keys(req.body).length > 0) {
            return res.status(400).send();
        }

        try {
            // use sequelize to verify database connection
            await sequelize.authenticate(); 
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send();
        } catch (error) {
            console.error('Connection error:', error);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(503).send(); 
        }
    } else {
        // Return error if there are any query parameters
        return res.status(400).send({ error: 'Invalid query parameters' });
    }
};

module.exports = { healthCheck };
