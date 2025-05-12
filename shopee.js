const axios = require('axios');
const crypto = require('crypto');

const PARTNER_ID = '2009397';
const PARTNER_KEY = '545777637371464f6a4d476d72636656585749486a566c5763626f76624e6459';
const SHOP_ID = '339683430';
const ENDPOINT = 'https://partner.shopeemobile.com/api/v2/order/get_order_detail';

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

async function getOrderSKU(orderNumber, accessToken) {
  const path = '/api/v2/order/get_order_detail';
  const timestamp = getTimestamp();
  const baseString = `${PARTNER_ID}${path}${timestamp}${accessToken}${SHOP_ID}`;
  const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
  const url = `${ENDPOINT}?partner_id=${PARTNER_ID}&shop_id=${SHOP_ID}&timestamp=${timestamp}&access_token=${accessToken}&sign=${sign}&order_sn_list=${orderNumber}&response_optional_fields=item_list`;

  try {
    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(`Shopee API error: ${response.data.error} - ${response.data.message}`);
    }

    const orderList = response.data.response?.order_list;
    if (!orderList || !orderList[0] || !orderList[0].item_list) {
      throw new Error('Order or SKU not found in Shopee response');
    }

    return orderList[0].item_list.map(item => item.item_sku);
  } catch (err) {
    if (err.response) {
      console.error('Shopee API error response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Shopee API request error:', err.message);
    }
    throw err;
  }
}

// --- Refresh Access Token ---
async function refreshAccessToken(refreshToken) {
  const path = '/api/v2/auth/access_token/get';
  const timestamp = getTimestamp();
  const baseString = `${PARTNER_ID}${path}${timestamp}`;
  const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
  const url = `https://partner.shopeemobile.com${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`;

  const body = {
    refresh_token: refreshToken,
    partner_id: Number(PARTNER_ID),
    shop_id: Number(SHOP_ID),
  };

  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.data.error) {
    throw new Error(`Shopee refresh error: ${response.data.error} - ${response.data.message}`);
  }

  // Return new tokens
  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
}

module.exports = { getOrderSKU, refreshAccessToken };