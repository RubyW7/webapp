const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.post('/v1/user', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'Bad Request: Missing required fields' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Bad Request: User already exists' });
        }

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password
        });

        return res.status(201).json({
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            account_created: newUser.account_created,
            account_updated: newUser.account_updated
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
