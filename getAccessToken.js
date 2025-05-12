const axios = require('axios');
const crypto = require('crypto');

const PARTNER_ID = '2009397';
const PARTNER_KEY = '545777637371464f6a4d476d72636656585749486a566c5763626f76624e6459';
const SHOP_ID = '339683430';
const REDIRECT_URI = 'https://www.educationhub.me';
const CODE = '77736e5666526b48445747594e734279';

async function getAccessToken() {
  const path = '/api/v2/auth/token/get';
  const timestamp = Math.floor(Date.now() / 1000);

  const bodyObj = {
    code: CODE,
    partner_id: Number(PARTNER_ID),
    shop_id: Number(SHOP_ID),
    redirect_uri: REDIRECT_URI,
  };
  const body = JSON.stringify(bodyObj);

  // Shopee signature for this endpoint: partner_id + path + timestamp
  const baseString = `${PARTNER_ID}${path}${timestamp}`;
  const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');

  const url = `https://partner.shopeemobile.com${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`;

  try {
    const response = await axios.post(url, bodyObj, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Shopee Access Token Response:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Shopee API error response:', err.response.data);
    } else {
      console.error('Shopee API request error:', err.message);
    }
  }
}

getAccessToken();