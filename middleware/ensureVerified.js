const User = require("../models/user");

const ensureVerified = async (req, res, next) => {
    // 假设用户ID或其他唯一标识符已经在之前的 `authenticate` 中间件中添加到了req对象
    const userId = req.userId;

    try {
        // 查询数据库以获取用户信息
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.verified) {
            next();  // 用户已验证，继续处理请求
        } else {
            res.status(403).json({ message: "Please verify your email address to access this feature." });
        }
    } catch (error) {
        console.error("Error accessing user data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = ensureVerified;