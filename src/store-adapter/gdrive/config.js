const config = require('../../config');

const { ConfigError } = require('../../errors');

function envs(options) {
  const chunksAmount =
    options.gdriveChunks || config.FILE_UPLOADER_GDRIVE_CHUNKS;

  const teamDriveName =
    options.gdriveTeamdrive || config.FILE_UPLOADER_GDRIVE_TEAMDRIVE;

  const clientEmail =
    options.gdriveClientEmail || config.FILE_UPLOADER_GDRIVE_CLIENT_EMAIL;

  const privateKey =
    options.gdrivePrivateKey || config.FILE_UPLOADER_GDRIVE_PRIVATE_KEY;

  const configErrors = [];

  if (!chunksAmount) {
    configErrors.push('Use --gdrive-chunks or set up FILE_UPLOADER_GDRIVE_CHUNKS');
  }

  if (!teamDriveName) {
    configErrors.push('Use --gdrive-teamdrive or set up FILE_UPLOADER_GDRIVE_TEAMDRIVE');
  }

  if (!clientEmail) {
    configErrors.push('Use --gdrive-client-email or set up FILE_UPLOADER_GDRIVE_CLIENT_EMAIL');
  }

  if (!privateKey) {
    configErrors.push('Use --gdrive-private-key or set up FILE_UPLOADER_GDRIVE_PRIVATE_KEY');
  }

  if (configErrors.length > 0) {
    throw new ConfigError(configErrors.join('\n'));
  }

  return {
    teamDriveName,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    chunkSize: chunksAmount * 256 * 1024,
  };
}

module.exports = envs;
