

  const { getOrderSKU } = require('./shopee');
  const ORDER_NUMBER = '250511JVGU0KXQ';
  const ACCESS_TOKEN = '54506b665570746c4e4570516478544f';


  (async () => {
    try {
      const sku = await getOrderSKU(ORDER_NUMBER, ACCESS_TOKEN);
      console.log('SKU:', sku);
    } catch (err) {
      console.error('Error:', err.message);
    }
  })();