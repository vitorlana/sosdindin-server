// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for Flutter app
app.use(cors());
app.use(express.json());

// Hello World endpoint
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello World'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

