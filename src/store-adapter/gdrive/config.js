const config = require('../../config');

const { ConfigError } = require('../../errors');

function envs(options) {
  const chunkSize = options.gdriveChunkSize || config.FILE_UPLOADER_GDRIVE_CHUNK_SIZE;
  if (!chunkSize) {
    throw new ConfigError(
      'Use --gdrive-chunk-size or set up FILE_UPLOADER_GDRIVE_CHUNK_SIZE',
    );
  } else if (chunkSize % (256 * 1024) !== 0) {
    throw new ConfigError('The chunk size must be multiples of 256Kb');
  }

  const teamDriveName =
    options.gdriveTeamdrive || config.FILE_UPLOADER_GDRIVE_TEAMDRIVE;
  if (!teamDriveName) {
    throw new ConfigError(
      'Use --gdrive-teamdrive or set up FILE_UPLOADER_GDRIVE_TEAMDRIVE',
    );
  }

  const clientEmail = options.gdriveClientEmail || config.FILE_UPLOADER_GDRIVE_CLIENT_EMAIL;
  if (!clientEmail) {
    throw new ConfigError(
      'Use --gdrive-client-email or set up FILE_UPLOADER_GDRIVE_CLIENT_EMAIL',
    );
  }

  const privateKey = options.gdrivePrivateKey || config.FILE_UPLOADER_GDRIVE_PRIVATE_KEY;
  if (!privateKey) {
    throw new ConfigError(
      'Use --gdrive-private-key or set up FILE_UPLOADER_GDRIVE_PRIVATE_KEY',
    );
  }

  return {
    teamDriveName,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    chunkSize,
  };
}

module.exports = envs;
