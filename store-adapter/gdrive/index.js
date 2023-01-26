const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { google } = require('googleapis');
const envs = require('./envs');
const { StreamProcessor } = require('../../stream-processor');
const { splitPathToFoldersList } = require('../../util');

const {
  UploadUrlError,
  FolderError,
  TeamDriveError,
} = require('../../errors');

class GDriveAdapter {
  static async createAdapter() {
    const {
      teamDriveName,
      clientEmail,
      privateKey,
      chunkSize,
    } = envs();

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

    return new GDriveAdapter(
      client,
      teamDriveName,
      jwt,
      chunkSize,
    );
  }

  constructor(client, teamDriveName, jwt, chunkSize) {
    this.client = client;
    this.teamDriveName = teamDriveName;
    this.jwt = jwt;
    this.chunkSize = chunkSize;
  }

  async uploadResumableFile(
    remoteFilePath,
    fileStream,
    fileSize,
  ) {
    const {
      dir: folderPath,
      base: fileName,
    } = path.parse(remoteFilePath);

    const teamDriveId = await this.getTeamDriveId();

    const folderId = await this.searchFolderId(
      teamDriveId,
      teamDriveId,
      splitPathToFoldersList(folderPath),
      0,
    );

    const uploadUrl = await this.createResumableUploadUrl({
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      supportsAllDrives: true,
      driveId: teamDriveId,
    }, {
      name: fileName,
      parents: [folderId],
    });

    const processor = new StreamProcessor(
      fileStream,
      this.chunkSize,
    );

    processor.process(async (
      startByte,
      dataChunk,
    ) => (
      new Promise((resolve, reject) => {
        const range = `${startByte} - ${startByte + dataChunk.length - 1}/${fileSize}`
        console.log(`uploading ${range}`);

        axios({
          method: "PUT",
          url: uploadUrl,
          headers: {
            "Content-Range": `bytes ${range}`,
          },
          data: dataChunk,
        }).then(({ data }) => (
          resolve(data)
        )).catch((err) => {
          if (err.response && err.response.status == 308) {
            resolve();
          } else {
            console.log("Retry");
            reject(err);
          }
        });
      })
    ));
  }

  async createResumableUploadUrl(queryOptions = {}, fileMetadata = {}) {
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
      params: queryOptions,
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(fileMetadata),
    });

    if (urlResult.status !== 200) {
      throw new UploadUrlError(JSON.stringify(urlResult));
    }

    const { headers: { location } } = urlResult;

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

    return jwt.sign(
      payload,
      privateKey,
      options,
    );
  }

  async getTeamDriveId() {
    const result = await this.client.drives.list({
      q: `name = '${this.teamDriveName}'`
    });

    const { drives } = result.data;

    if (drives.length === 0) {
      throw new TeamDriveError(`'${this.teamDriveName}' drive is absent`);
    }

    return drives[0].id;
  }

  async searchFolderId(teamDriveId, folderId, folders, idx) {
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
      driveId: teamDriveId,
      q,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      supportsAllDrives: true,
    });

    const currentFolderName = `/${folders.slice(0, idx + 1).join('/')}`;

    const foundFolders = result.data.files;
    if (foundFolders.length === 0) {
      throw new FolderError(`${currentFolderName} is absent`);
    } else if (foundFolders.length > 1) {
      throw new FolderError(`${currentFolderName} exists more than one`);
    }

    const _folderId = foundFolders[0].id;

    return this.searchFolderId(
      teamDriveId,
      _folderId,
      folders,
      idx + 1,
    );
  }
}

module.exports = {
  GDriveAdapter,
};
