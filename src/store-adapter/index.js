const { AdapterError } = require('../errors');
const { GDriveAdapter } = require('./gdrive');

const GDRIVE_TYPE = 'gdrive';
const TYPES = [GDRIVE_TYPE];

class StoreAdapter {
  static async createAdapter(uploaderType, options) {
    if (uploaderType === GDRIVE_TYPE) {
      return GDriveAdapter.createAdapter(options);
    }

    throw new AdapterError(`You have to choose one of adapters: ${TYPES.join(',')}`);
  }
}

module.exports = {
  StoreAdapter,
};
