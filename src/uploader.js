const fs = require('fs');

class Uploader {
  constructor(storeAdapter) {
    this.storeAdapter = storeAdapter;
  }

  async uploadFile(localFilePath, remoteFilePath) {
    const { size } = await fs.promises.stat(localFilePath);

    const fileStream = fs.createReadStream(localFilePath);

    await this.storeAdapter.uploadResumableFile(
      remoteFilePath,
      fileStream,
      size,
    );
  }
}

class UploaderFactory {
  static createUploader(storeAdapter) {
    return new Uploader(storeAdapter);
  }
}

module.exports = {
  UploaderFactory,
};
