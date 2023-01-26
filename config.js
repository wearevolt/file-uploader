const dotenv = require('dotenv');

dotenv.config();

const GDRIVE_TEAMDRIVE_NAME = (process.env.GDRIVE_TEAMDRIVE_NAME || '').trim();
const GDRIVE_CLIENT_EMAIL = process.env.GDRIVE_CLIENT_EMAIL;
const GDRIVE_PRIVATE_KEY = process.env.GDRIVE_PRIVATE_KEY
  && process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n');

const CHUNK_SIZE = process.env.CHUNK_SIZE || 256 * 1024 * 100; // must be multiples of 256Kb

module.exports = {
  GDRIVE_TEAMDRIVE_NAME,
  GDRIVE_CLIENT_EMAIL,
  GDRIVE_PRIVATE_KEY,
  CHUNK_SIZE,
};
