// middleware/auth.js
const basicAuth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models'); 

const authenticateUser = async (req, res, next) => {
    const credentials = basicAuth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
        return res.status(401).send({ error: '未经授权' });
    }

    try {
        const user = await User.findOne({ where: { email: credentials.name } });

        if (!user || !(await bcrypt.compare(credentials.pass, user.password))) {
            return res.status(401).send({ error: '未经授权' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).send({ error: '服务器内部错误' });
    }
};

module.exports = authenticateUser;
