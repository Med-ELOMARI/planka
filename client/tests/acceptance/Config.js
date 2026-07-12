const BASE_URL = process.env.BASE_URL || 'http://localhost:1337';

const TIMEOUT = parseInt(process.env.TIMEOUT, 10) || 30000;

const PLAYWRIGHT = {
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO, 10) || 0,
};

export default {
  BASE_URL,
  TIMEOUT,
  PLAYWRIGHT,
};
