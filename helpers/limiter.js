const Queue = require('promise-queue');

const config = {
  seconds: 100,
  requests: 100,
};

const readQueue = new Queue(1, Infinity);
const writeQueue = new Queue(1, Infinity);

let lastReadTs = 0;
let lastWriteTs = 0;

const enqueueRead = async (fn) => {
  await wait(readQueue, lastReadTs);
  let result, error;
  try {
    result = await fn();
  } catch (err) {
    error = err;
  }
  lastReadTs = new Date().getTime();
  if (error) {
    throw error;
  } else {
    return result;
  }
}

const enqueueWrite = async (fn) => {
  await wait(writeQueue, lastWriteTs);
  let result, error;
  try {
    result = await fn();
  } catch (err) {
    error = err;
  }
  lastWriteTs = new Date().getTime();
  if (error) {
    throw error;
  } else {
    return result;
  }
}

const wait = (queue, lastTs) => {
  return queue.add(async () => {
    const now = new Date().getTime();
    const interval = config.seconds * 1000 / config.requests;
    const sinceLast = now - lastTs;
    if (sinceLast < interval) {
      await new Promise(resolve => setTimeout(resolve, interval - sinceLast));
    }
  });
}

module.exports = {
  enqueueRead,
  enqueueWrite,
};
