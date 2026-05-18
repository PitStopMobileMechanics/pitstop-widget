exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('Saving contact:', data);

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/PitStop%20Contacts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Name':                 data.name || '',
            'Phone':                data.phone || '',
            'Email':                data.email || '',
            'Desired Service':      data.service || '',
            'Zip Code':             data.zip || '',
            'License Plate':        data.licensePlate || '',
            'License Plate State':  data.licensePlateState || '',
            'VIN':                  data.vin || '',
            'Year':                 data.year || '',
            'Make':                 data.make || '',
            'Model':                data.model || '',
            'Trim':                 data.trim || '',
            'Engine':               data.engine || '',
            'Drivetrain':           data.drivetrain || '',
            'Date Submitted':       new Date().toISOString().split('T')[0]
          }
        })
      }
    );

    const result = await airtableResponse.json();
    console.log('Airtable response:', JSON.stringify(result));

    if (!airtableResponse.ok) {
      throw new Error(result.error?.message || 'Airtable save failed');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: result.id })
    };

  } catch (err) {
    console.log('Error saving contact:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
