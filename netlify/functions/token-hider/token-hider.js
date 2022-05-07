const process = require('process');

const axios = require('axios');
const qs = require('qs');

const handler = async function (event) {
  const { API_TOKEN } = process.env;
  const characterNumber = Math.floor(Math.random() * 932);
  const URL = `https://the-one-api.dev/v2/character?limit=1&race!=Dragons,Dragon&offset=${characterNumber}`;

  try {
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: API_TOKEN,
      },
    });
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    const { data, headers, status, statusText } = error.response;
    return {
      statusCode: error.response.status,
      body: JSON.stringify({ status, statusText, headers, data }),
    };
  }
};

module.exports = { handler };
