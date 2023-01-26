const { program } = require('commander');

const { UploaderFactory } = require('./uploader');
const { GDriveAdapter } = require('./store-adapter/gdrive');

program
  .name('gdrive-uploader')
  .description('Upload a file to an external store');

program
  .arguments('<local_file_path> <remote_folder_path>')
  .action(async (localFilePath, remoteFilePath) => {
    const adapter = await GDriveAdapter.createAdapter();

    await UploaderFactory
      .createUploader(adapter)
      .uploadFile(localFilePath, remoteFilePath);
  });

program.parse();
