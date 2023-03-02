const fetch = import('node-fetch').default;
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.twitch.tv/helix';
const AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const CLIENT_ID = ''; //클라이언트 입력
const CLIENT_SECRET = ''; //클라이언트 비번 입력

let authToken = '';

async function getChannelsToRecord(saveDir, recordingChannels) {
  const fetch = await import('node-fetch').then(module => module.default);
  const keywords = await fs.promises.readFile('keyword.txt', 'utf-8');
  const channelsText = await fs.promises.readFile('channellist.txt', 'utf-8');
  const channelsToRecord = channelsText.trim().split(' ');

  const title_keyword = keywords.trim();
  let channels = [];

  const headers = {
    'Client-Id': CLIENT_ID,
    'Authorization': `Bearer ${await getAuthToken()}`
  };

  const params = new URLSearchParams({
    language: 'ko',
    first: 100
  });
  let url = `${API_URL}/streams?${params.toString()}`;

  let iteration = 1;
  process.stdout.write(`Searching for channels with '${title_keyword}' in title... (iteration ${iteration})\r`);

  let pagination = null;
  do {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`API error (${response.status}): ${await response.text()}`);
      return [];
    }
    const json = await response.json();
    channels = channels.concat(
      json.data
        .filter(stream => stream.type === 'live' && channelsToRecord.includes(stream.user_login) && stream.title.includes(title_keyword) && !recordingChannels.has(stream.user_login))
        .map(stream => ({
          channel: stream.user_login,
          streamInfo: stream
        }))
    );
    pagination = json.pagination;
    if (pagination && pagination.cursor) {
      url = `${API_URL}/streams?${params.toString()}&after=${pagination.cursor}`;
    }
    iteration++;
    process.stdout.write(`Searching for channels with '${title_keyword}' in title... (iteration ${iteration})\r`);
  } while (pagination && pagination.cursor);

  console.log(`\nFound ${channels.length} channels with '${title_keyword}' in title`);
  
  return [channels, title_keyword];
}


async function getAuthToken() {
  const fetch = await import('node-fetch').then(module => module.default);
  if (authToken) {
      return authToken;
  }
  const data = querystring.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
  });
  const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
      },
      body: data
  };
  const response = await fetch(AUTH_URL, options);
  if (!response.ok) {
      console.error(`Failed to fetch auth token(${response.status}): ${await response.text()}`);
      return null;
  }
  const json = await response.json();
  authToken = json.access_token;
  return authToken;
}

module.exports = { getChannelsToRecord };
