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
    const { year, make, model, trim, vin } = JSON.parse(event.body);
    console.log('Getting services for:', { year, make, model, trim, vin });

    // Build the request URL — use VIN if available, otherwise year/make/model
    let url;
    if (vin) {
      url = `https://api.vehicledatabases.com/repair-pricing/vin/${encodeURIComponent(vin)}`;
    } else {
      url = `https://api.vehicledatabases.com/repair-pricing/${encodeURIComponent(year)}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
      if (trim) url += `/${encodeURIComponent(trim)}`;
    }

    console.log('Calling VehicleDatabases URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-AuthKey': process.env.VEHICLEDB_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('VehicleDatabases status:', response.status);
    console.log('VehicleDatabases response keys:', Object.keys(data));

    if (!response.ok) {
      throw new Error(data.message || 'Could not retrieve service data');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.log('Error getting services:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
