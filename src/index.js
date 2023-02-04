const path = require('path');
const { program } = require('commander');

const container = require('./container');

const { UploaderFactory } = require('./uploader');
const { StoreAdapter } = require('./store-adapter');
const { AppError } = require('./errors');
const { Logger } = require('./logger');

const readJson = require('read-package-json');

const run = (pkgJson) => {
  program.name('file-uploader').description(pkgJson.description);

  program
    .argument('<type>', 'The type of the uploading (gdrive)')
    .argument('<local_file_path>', 'The path of the local file')
    .argument('<remote_folder_path>', 'The path of the remote folder')
    .option(
      '--gdrive-teamdrive <name>',
      'The name of the gdrive teamdrive',
    )
    .option(
      '--gdrive-client-email <email>',
      'The client email of the service account',
    )
    .option(
      '--gdrive-private-key <key>',
      'The private key of the service account. All newlines must be replaced by "\\n"',
    )
    .option(
      '--gdrive-chunks <count>',
      'The number of chunks for uploading at a time. The one chunk size is 256Kb',
    )
    .option(
      '--debug',
      'Show more log messages',
    )
    .action(async (uploaderType, localFilePath, remoteFilePath, options) => {
      const logger = new Logger(options.debug);

      container.register('logger', logger);

      try {
        const adapter = await StoreAdapter.createAdapter(uploaderType, options);

        await UploaderFactory.createUploader(adapter).uploadFile(
          localFilePath,
          remoteFilePath,
        );
      } catch (err) {
        if (err instanceof AppError) {
          logger.error(err.message);
          process.exit(1);
        } else {
          throw err;
        }
      }
    });

  program.parse();
};

const packageJsonPath = path.resolve(__dirname, '../package.json');

readJson(packageJsonPath, console.error, false, (err, pkgJson) => {
  run(pkgJson);
});
