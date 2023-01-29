class AppError extends Error {}
class ConfigError extends AppError {}
class FolderError extends AppError {}
class AdapterError extends AppError {}

class GDriveError extends AppError {}
class UploadUrlError extends GDriveError {}
class TeamDriveError extends GDriveError {}

module.exports = {
  AppError,
  ConfigError,
  FolderError,
  AdapterError,

  UploadUrlError,
  TeamDriveError,
};
