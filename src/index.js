const { program } = require('commander');

const { UploaderFactory } = require('./uploader');
const { StoreAdapter } = require('./store-adapter');

const readJson = require('read-package-json');

const run = (pkgJson) => {
  program.name(pkgJson.name).description(pkgJson.description);

  program
    .arguments('<local_file_path> <remote_folder_path>')
    .options('--gdrive', 'Upload on Google Drive')
    .action(async (localFilePath, remoteFilePath, options) => {
      const adapter = await StoreAdapter.createAdapter(options);

      await UploaderFactory.createUploader(adapter).uploadFile(
        localFilePath,
        remoteFilePath,
      );
    });

  program.parse();
};

readJson('./package.json', console.error, false, (err, pkgJson) => {
  run(pkgJson);
});
