file-uploader
=============

Install
-------

``` bash
$ yarn add @slavav/file-uploader
```

Run
---

``` bash
$ file-uploader <options> <type> <local file> <remote folder>
```

* type - the type of uploading (gdrive)
* local file - the path of the local file to upload
* remote folder - the path to a folder inside the shared folder

Adapter settings
----------------

### Google Drive

To upload files on Google Drive you have to create a service account and give it an access to a shared folder
where you upload files.

options:

* --gdrive-teamdrive-name - the name of the gdrive teamdrive (or set up FILE_UPLOADER_GDRIVE_TEAMDRIVE_NAME)
* --gdrive-client-email - the client email of the service account (or set up FILE_UPLOADER_GDRIVE_CLIENT_EMAIL)
* --gdrive-private-key - the private key of the service account (or set up FILE_UPLOADER_GDRIVE_PRIVATE_KEY)
* --gdrive-chunk-size - the size of a chunk for uploading. The size must be multiples of 256Kb (or set up FILE_UPLOADER_GDRIVE_CHUNK_SIZE)
