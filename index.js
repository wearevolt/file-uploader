const { program } = require('commander');

const { UploaderFactory } = require('./uploader');
const { GDriveAdapter } = require('./store-adapter/gdrive');

const readJson = require('read-package-json');

const run = (pkgJson) => {
  program.name(pkgJson.name).description(pkgJson.description);

  program
    .arguments('<local_file_path> <remote_folder_path>')
    .action(async (localFilePath, remoteFilePath) => {
      const adapter = await GDriveAdapter.createAdapter();

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
