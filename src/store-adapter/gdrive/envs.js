const config = require('../../config');

const { ConfigError } = require('../../errors');

function envs() {
  const chunkSize = config.CHUNK_SIZE;
  if (!chunkSize) {
    throw new ConfigError('Set up CHUNK_SIZE');
  } else if (chunkSize % (256 * 1024) !== 0) {
    throw new ConfigError('The chunk size must be multiples of 256Kb');
  }

  const teamDriveName = config.GDRIVE_TEAMDRIVE_NAME;
  if (!teamDriveName) {
    throw new ConfigError('Set up GDRIVE_TEAMDRIVE_NAME');
  }

  const clientEmail = config.GDRIVE_CLIENT_EMAIL;
  if (!clientEmail) {
    throw new ConfigError('Set up GDRIVE_CLIENT_EMAIL');
  }

  const privateKey = config.GDRIVE_PRIVATE_KEY;
  if (!privateKey) {
    throw new ConfigError('Set up GDRIVE_PRIVATE_KEY');
  }

  return {
    teamDriveName,
    clientEmail,
    privateKey,
    chunkSize,
  };
}

module.exports = envs;
