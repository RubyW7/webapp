const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/auth');

const User = require('../models/user');

router.get('/v1/user/self', authenticate, async (req, res) => {
    try {
        const user = req.user;

        res.header('Accept', 'application/json'); 

        return res.status(200).json({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            account_created: user.account_created,
            account_updated: user.account_updated
        });
    } catch (error) {
        console.error('Error fetching user information:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/v1/user', 
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { first_name, last_name, email, password } = req.body;

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

            res.header('Accept', 'application/json');

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
    }
);

module.exports = router;
