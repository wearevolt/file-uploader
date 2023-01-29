const { AdapterError } = require('../errors');
const { GDriveAdapter } = require('./gdrive');

class StoreAdapter {
  static async createAdapter(uploaderType, options) {
    if (uploaderType === 'gdrive') {
      return GDriveAdapter.createAdapter(options);
    }

    throw new AdapterError('You have to choose one of adapters: gdrive');
  }
}

module.exports = {
  StoreAdapter,
};
