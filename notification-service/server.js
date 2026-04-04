require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log(`Notification Service on port ${PORT}`));