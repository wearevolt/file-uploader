const stream = require('stream');

class StreamProcessor {
  constructor(uploadStream, chunkSize) {
    this.uploadStream = uploadStream;
    this.chunkSize = chunkSize;
  }

  async process(uploadCallback) {
    const streamTrans = new stream.Transform({
      transform: function (chunk, _, callback) {
        callback(null, chunk);
      },
    });

    this.uploadStream.pipe(streamTrans);

    return new Promise((resolve, reject) => {
      let bufs = [];
      let startByte = 0;

      streamTrans.on('data', async (chunk) => {
        bufs.push(chunk);

        const temp = Buffer.concat(bufs);

        if (temp.length >= this.chunkSize) {
          const dataChunk = Uint8Array.prototype.slice.call(
            temp,
            0,
            this.chunkSize,
          );
          const left = Uint8Array.prototype.slice.call(temp, this.chunkSize);

          streamTrans.pause();

          let upcount = 0;

          const upload = function () {
            uploadCallback(startByte, dataChunk)
              .then((data) => {
                if (data) {
                  resolve(data);
                } else {
                  startByte += dataChunk.length;
                  streamTrans.resume();
                }
              })
              .catch((err) => {
                if (upcount == 3) {
                  reject(err);
                } else {
                  upcount++;
                  upload();
                }
              });
          };

          upload();
          bufs = [left];
        }
      });

      streamTrans.on('end', () => {
        const dataChunk = Buffer.concat(bufs);

        if (dataChunk.length > 0) {
          let upcount = 0;

          const upload = function () {
            uploadCallback(startByte, dataChunk)
              .then((data) => {
                resolve(data);
              })
              .catch((err) => {
                if (upcount == 3) {
                  reject(err);
                } else {
                  upcount++;
                  upload();
                }
              });
          };

          upload();
        }
      });

      streamTrans.on('error', (err) => reject(err));
    });
  }
}

module.exports = {
  StreamProcessor,
};
