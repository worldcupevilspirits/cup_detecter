const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const twitch_token = ''; //광고 제거를 위해 토큰을 입력

async function startRecording(channelInfo, recordingChannels, maxConcurrentRecordings, quality, saveDir, title_keyword) {
  const { channel, streamInfo } = channelInfo;

  if (streamInfo && !recordingChannels.has(channel)) {
    await recordingChannels.add(channel);
    console.log(`${channel} is online`);

    // create the save directory for the channel's recordings
    const savePath = path.join(saveDir, channel);
    try {
      await fs.promises.mkdir(savePath, { recursive: true });
    } catch (error) {
      console.error(error.message);
    }

    // generate the filename for the recording
    const title = streamInfo.title.replace(/[^\w가-힣]/g, '') || 'Untitled';
    const fileName = `${channel}-${getDate()}-${title}.ts`;
    const filePath = path.join(savePath, fileName);

    // spawn the streamlink process to start the recording
    const args = [
      'streamlink',
      `--twitch-api-header=Authorization=OAuth ${twitch_token}`,
      '--hls-live-restart',
      '--stream-segment-attempts',
      '5',
      '--stream-segment-threads',
      '5',
      '--stream-segment-timeout',
      '10.0',
      '--default-stream',
      quality || 'best',
      '--url',
      `www.twitch.tv/${channel}`,
      '-o',
      filePath
    ];

    const streamLinkProcess = spawn(args[0], args.slice(1), { stdio: 'inherit' });
    streamLinkProcess.on('error', error => console.error(error.message));

    // Periodically check if the title has changed and terminate the recording if it has
    const interval = setInterval(async () => {
      const response = await fetch(`${API_URL}/streams?user_login=${channel}`, { headers });
      if (!response.ok) {
        console.error(`API error (${response.status}): ${await response.text()}`);
        return;
      }
      const json = await response.json();
      if (json.data.length > 0 && json.data[0].title !== streamInfo.title) {
        // If the title has changed, check if the new title contains the title keyword
        const newTitle = json.data[0].title;
        if (newTitle.includes(title_keyword)) {
          // If the new title contains the title keyword, update the streamInfo object and continue recording
          console.log(`${channel} has changed the title of the stream to "${newTitle}".`);
          streamInfo.title = newTitle;
        } else {
          // If the new title does not contain the title keyword, terminate the recording and clear the interval
          console.log(`${channel} has changed the title of the stream to "${newTitle}". Terminating recording...`);
          streamLinkProcess.kill();
          clearInterval(interval);
          recordingChannels.delete(channel);
        }
      }
    }, 60000); // Check every minute

    streamLinkProcess.on('exit', () => {
      clearInterval(interval);
      recordingChannels.delete(channel);
    });
  } else if (streamInfo) {
    console.log(`${channel} is already being recorded`);
  } else {
    console.log(`${channel} is offline`);
  }
}



function getDate() {
  const date = new Date();
  return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
}

module.exports = { startRecording };