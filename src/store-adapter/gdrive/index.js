const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { google } = require('googleapis');
const config = require('./config');
const { StreamProcessor } = require('../../stream-processor');
const { splitPathToFoldersList } = require('../../util');
const container = require('../../container');

const { UploadUrlError, FolderError, TeamDriveError } = require('../../errors');

const API_COMMON_OPTIONS = {
  includeItemsFromAllDrives: true,
  corpora: 'drive',
  supportsAllDrives: true,
};

class GDriveAdapter {
  static async createAdapter(options) {
    const { teamDriveName, clientEmail, privateKey, chunkSize } =
      config(options);

    const auth = await google.auth.getClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: 'https://www.googleapis.com/auth/drive',
    });

    const client = google.drive({
      version: 'v3',
      auth,
    });

    const jwt = this.gdriveJWT(clientEmail, privateKey);

    return new GDriveAdapter(client, teamDriveName, jwt, chunkSize);
  }

  constructor(client, teamDriveName, jwt, chunkSize) {
    this.client = client;
    this.teamDriveName = teamDriveName;
    this.jwt = jwt;
    this.chunkSize = chunkSize;

    this.logger = container.resolve('logger');
  }

  async uploadResumableFile(remoteFilePath, fileStream, fileSize) {
    const { dir: folderPath, base: fileName } = path.parse(remoteFilePath);

    const teamDriveId = await this.getTeamDriveId();

    const folderId = await this.searchOrCreateRemoteFolderAndReturnId(
      teamDriveId,
      teamDriveId,
      splitPathToFoldersList(folderPath),
      0,
    );

    const uploadUrl = await this.createResumableUploadUrl(
      teamDriveId,
      fileName,
      folderId,
    );

    const processor = new StreamProcessor(fileStream, this.chunkSize);

    processor.process(
      async (startByte, dataChunk) =>
        new Promise((resolve, reject) => {
          const finishByte = startByte + dataChunk.length - 1;
          const range = `${startByte} - ${finishByte}/${fileSize}`;
          this.logger.debug(`uploading ${range}`);

          axios({
            method: 'PUT',
            url: uploadUrl,
            headers: {
              'Content-Range': `bytes ${range}`,
            },
            data: dataChunk,
          })
            .then(({ data }) => resolve(data))
            .catch((err) => {
              if (err.response && err.response.status == 308) {
                resolve();
              } else {
                this.logger.debug('Retry', err.message);
                reject(err);
              }
            });
        }),
    );
  }

  async createResumableUploadUrl(teamDriveId, fileName, parentFolderId) {
    const tokenResult = await axios({
      method: 'POST',
      url: 'https://oauth2.googleapis.com/token',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: this.jwt,
      }),
    });

    if (tokenResult.status !== 200) {
      throw new UploadUrlError(JSON.stringify(tokenResult));
    }

    const { access_token } = tokenResult.data;

    const urlResult = await axios({
      method: 'POST',
      url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      params: {
        ...API_COMMON_OPTIONS,
        driveId: teamDriveId,
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        name: fileName,
        parents: [parentFolderId],
      }),
    });

    if (urlResult.status !== 200) {
      throw new UploadUrlError(JSON.stringify(urlResult));
    }

    const {
      headers: { location },
    } = urlResult;

    return location;
  }

  static gdriveJWT(clientEmail, privateKey) {
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      iat: Math.round(Date.now() / 1000),
    };

    const options = {
      algorithm: 'RS256',
      expiresIn: '1h',
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
    };

    return jwt.sign(payload, privateKey, options);
  }

  async getTeamDriveId() {
    const result = await this.client.drives.list({
      q: `name = '${this.teamDriveName}'`,
    });

    const { drives } = result.data;

    if (drives.length === 0) {
      throw new TeamDriveError(`'${this.teamDriveName}' drive is absent`);
    }

    return drives[0].id;
  }

  async createFolder(teamDriveId, parentFolderId, folderName) {
    return this.client.files.create({
      ...API_COMMON_OPTIONS,
      driveId: teamDriveId,
      resource: {
        mimeType: 'application/vnd.google-apps.folder',
        name: folderName,
        parents: [parentFolderId],
      },
    });
  }

  async searchOrCreateRemoteFolderAndReturnId(teamDriveId, folderId, folders, idx) {
    if (idx >= folders.length) {
      return folderId;
    }

    const folderName = folders[idx];
    if (!folderName) {
      throw new FolderError('The folder name is empty');
    }

    const q = [
      `name = '${folderName}'`,
      `'${folderId}' in parents`,
      'trashed = false',
      "mimeType = 'application/vnd.google-apps.folder'",
    ].join(' and ');

    const result = await this.client.files.list({
      ...API_COMMON_OPTIONS,
      driveId: teamDriveId,
      q,
    });

    const currentFolderName = `/${folders.slice(0, idx + 1).join('/')}`;

    const foundFolders = result.data.files;
    let _folderId;

    if (foundFolders.length === 1) {
      _folderId = foundFolders[0].id;
    } else if (foundFolders.length === 0) {
      this.logger.debug(`Creating a folder: ${currentFolderName}`);

      const createResult = await this.createFolder(teamDriveId, folderId, folderName);
      _folderId = createResult.data.id;
    } else {
      throw new FolderError(`${currentFolderName} exists more than one`);
    }

    return this.searchOrCreateRemoteFolderAndReturnId(teamDriveId, _folderId, folders, idx + 1);
  }
}

module.exports = {
  GDriveAdapter,
};
