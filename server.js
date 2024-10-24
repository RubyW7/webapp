const app = require("./app");
const { initializeDatabase } = require("./services/databaseService");

initializeDatabase()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during database initialization:", err);
  });
