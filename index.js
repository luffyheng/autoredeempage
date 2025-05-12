const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getOrderSKU } = require('./shopee');
const { getCourseLink } = require('./googleSheet');
const { refreshAccessToken } = require('./shopee');

const TOKENS_PATH = path.join(__dirname, 'tokens.json');

function loadTokens() {
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/redeem', async (req, res) => {
  const { orderNumber } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, message: 'Order number is required.' });
  }

  let tokens = loadTokens();
  let skus;
  let triedRefresh = false;

  while (true) {
    try {
      skus = await getOrderSKU(orderNumber, tokens.access_token);
      break; // Success!
    } catch (err) {
      // If token is invalid, try to refresh once
      if (
        !triedRefresh &&
        err.message &&
        err.message.toLowerCase().includes('invalid access_token')
      ) {
        triedRefresh = true;
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          tokens = { ...tokens, ...newTokens };
          saveTokens(tokens);
          continue; // Retry with new token
        } catch (refreshErr) {
          return res.status(500).json({ success: false, message: 'Failed to refresh access token.' });
        }
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  try {
    const courses = [];
    for (const sku of skus) {
      const course = await getCourseLink(sku);
      if (course && course.link) {
        courses.push({ sku, ...course });
      }
    }
    if (courses.length > 0) {
      res.json({ success: true, courses });
    } else {
      res.json({ success: false, message: 'No courses found for these SKUs.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});