// backend/testGoogleSheet.js

const { getCourseLink } = require('./googleSheet');

(async () => {
  const sku = 'a281'; // Replace with a SKU from your sheet
  const result = await getCourseLink(sku);
  console.log(result);
})();