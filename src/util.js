const { FolderError } = require('./errors');

function splitPathToFoldersList(folderPath) {
  let _folderPath = (folderPath || '').trim();
  if (!_folderPath) {
    throw new FolderError('The folder path is necessary');
  }

  _folderPath = _folderPath.replace(/^\//, '');
  if (!_folderPath) {
    return [];
  }

  return _folderPath.split('/');
}

module.exports = {
  splitPathToFoldersList,
};
