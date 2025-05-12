const { google } = require('googleapis');
const path = require('path');

// Load your service account key
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Your spreadsheet ID and range
const SPREADSHEET_ID = '1ZJEZrawSwY26mS1BDwvcibvPEACUWieELNPvjfEzoj0';
const RANGE = 'Sheet1!A:C'; // Adjust if your sheet name is different

async function getCourseLink(sku) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return null;

    // Find the row with the matching SKU (skip header row)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase() === sku.toLowerCase()) {
        return {
          link: rows[i][1],
          courseName: rows[i][2] || '',
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    throw err;
  }
}

module.exports = { getCourseLink };