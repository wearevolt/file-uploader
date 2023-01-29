const path = require('path');
const { program } = require('commander');

const { UploaderFactory } = require('./uploader');
const { StoreAdapter } = require('./store-adapter');

const readJson = require('read-package-json');

const run = (pkgJson) => {
  program.name('file-uploader').description(pkgJson.description);

  program
    .argument('<type>', 'The type of the uploading')
    .argument('<local_file_path>', 'The path of the local file')
    .argument('<remote_folder_path>', 'The path of the remote folder')
    .option(
      '--gdrive-teamdrive-name <name>',
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
      '--gdrive-chunk-size <size>',
      'The size of a chunk for uploading. The size must be multiples of 256Kb',
    )
    .action(async (uploaderType, localFilePath, remoteFilePath, options) => {
      const adapter = await StoreAdapter.createAdapter(uploaderType, options);

      await UploaderFactory.createUploader(adapter).uploadFile(
        localFilePath,
        remoteFilePath,
      );
    });

  program.parse();
};

const packageJsonPath = path.resolve(__dirname, '../package.json');

readJson(packageJsonPath, console.error, false, (err, pkgJson) => {
  run(pkgJson);
});
