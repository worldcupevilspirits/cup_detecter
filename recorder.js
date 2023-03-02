const { startRecording } = require('./recording');
const { getChannelsToRecord } = require('./channelWorker');

class Semaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.currentCount = 0;
    this.waiting = [];
  }

  acquire() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrent) {
        this.currentCount++;
        resolve();
      } else {
        this.waiting.push(resolve);
      }
    });
  }

  release() {
    this.currentCount--;
    if (this.waiting.length > 0) {
      const nextResolve = this.waiting.shift();
      nextResolve();
    }
  }
}

async function main() {
  const saveDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const maxConcurrentRecordings = new Semaphore(3); // limit to 3 concurrent recordings
  const retryPeriod = 10;
  const quality = 'best';

  const recordingChannels = new Set();
  const semaphore = new Semaphore(maxConcurrentRecordings);

  while (true) {
    const [channels, title_keyword] = await getChannelsToRecord(saveDir, recordingChannels);

    for (const channelInfo of channels) {
      await startRecording(channelInfo, recordingChannels, maxConcurrentRecordings, quality, saveDir);
    }

    console.log(`\nWaiting for ${retryPeriod} seconds before retrying...`);
    await sleep(retryPeriod);
  }
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

if (require.main === module) {
  main();
}
