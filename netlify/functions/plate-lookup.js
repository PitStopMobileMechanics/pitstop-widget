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
    const body = JSON.parse(event.body);
    const plate = body.plate;
    const state = body.state;

    console.log('Received request - plate:', plate, 'state:', state);
    console.log('API key present:', !!process.env.PLATE2VIN_KEY);

    if (!plate || !state) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Plate and state are required' })
      };
    }

    const response = await fetch('https://platetovin.com/api/convert', {
      method: 'POST',
      headers: {
        'Authorization': process.env.PLATE2VIN_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ plate, state })
    });

    const text = await response.text();
    console.log('PlateToVIN raw response:', text);
    console.log('PlateToVIN status:', response.status);

    const data = JSON.parse(text);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.log('Error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
