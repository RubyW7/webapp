const app = require('./app');
const sequelize = require('./config/db');

sequelize.sync({ alter: true }).then(() => {
    console.log("Database synchronized");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error("Error synchronizing the database:", err);
});
