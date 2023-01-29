file-uploader
=============

Install
-------

``` bash
$ yarn add file-uploader
```

Run
---

``` bash
$ file-uploader <options> <local file> <remote folder>
```

* local file - the path of the local file to upload
* remote folder - the path to a folder inside the shared folder

### options
--gdrive - to upload files on Google Drive

## Adapter settings

### Google Drive

To upload files on Google Drive you have to create a service account and give it an access to a shared folder
where you upload files.

You need to set the next environment variables

* GDRIVE_CLIENT_EMAIL - the email of the service account
* GDRIVE_PRIVATE_KEY - the private key of the service account. You must replace all new lines to '\n'
* GDRIVE_TEAMDRIVE_NAME - the name of the shared folder
