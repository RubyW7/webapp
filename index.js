require('dotenv').config();
const express = require('express');
const healthRoutes = require('./routes/health');

const app = express();
const port = 8080;

app.use(express.json()); 

app.use('/healthz', healthRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
