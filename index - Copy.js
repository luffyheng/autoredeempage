// backend/index.js

const express = require('express');
const cors = require('cors');
const { getCourseLink } = require('./googleSheet');

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/redeem expects { sku: "..." }
app.post('/api/redeem', async (req, res) => {
  const { sku } = req.body;
  if (!sku) {
    return res.status(400).json({ success: false, message: 'SKU is required.' });
  }
  try {
    const result = await getCourseLink(sku);
    if (result && result.link) {
      res.json({ success: true, link: result.link, courseName: result.courseName });
    } else {
      res.json({ success: false, message: 'Course not found for this SKU.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});