class AppError extends Error {}
class ConfigError extends AppError {}

class GDriveError extends AppError {}

class UploadUrlError extends GDriveError {}
class FolderError extends GDriveError {}
class TeamDriveError extends GDriveError {}

module.exports = {
  AppError,
  ConfigError,

  UploadUrlError,
  FolderError,
  TeamDriveError,
};
