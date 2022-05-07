const {Storage} = require('@google-cloud/storage');

const storage = new Storage(
    {  
      projectId: "kekk-c40d0",
      credentials :{
        "client_email": "firebase-adminsdk-qe244@kekk-c40d0.iam.gserviceaccount.com",
        "private_key": `-----BEGIN PRIVATE KEY-----\n${process.env.firebaseAdminPrivate_1}\n${process.env.firebaseAdminPrivate_2}\n4rglIJW91UNDOuoPJhn1g9/xGzfhDVUo3wY7PTTac1AluULBPVnYnmmWc8PvKFXs\nOsj8N+sR96HDaKCAqVQWlYuZue8PQwY5E2U2uO9w39A4lQ8Ku5IMnvuX3FKxl/2M\nKQJFyaHscxlHREjl0Cb/GtL+ErsvI1uvKvpijhoTyndGYE6FNI3ySxDU8UfI/vBt\n1PhjYC287j1ozx/TKORWU4GRf4yLGDvuTUolQobbmH831+TseAI3vT5n6Q6KwjgC\nVqrLevdbAgMBAAECggEAMXUkhBxYdnB85pnngGkgwSnad/CGC+Uui6xn1nDSDFzf\nk4YjKelEEDiY/ISpTxIlk0TzrAeS1Pt62uviU4fpBxUu0mHlrohYkhx932OaI/LY\nWfMuSH+92NRqUn3P1uR+qqv9KGS6d0I+1Wx1zB3EKKCQvzhfDkHKBBueu3o/G+Vs\n/7H7Y0nTKT8ld95aowxmpON04GGC7YFqbAzRuFVJ/HwqeI/3VZve7TLTxfHU/tzY\n0GvDkLtmNXIF6YKqaXC9o4yu73mQ4cyKmlXK/LbJ+kJwyZF8h9Q4ouD/O2P4RCBx\nO3OMg0ND2CiayXeWUjEIXdKIo5WeznvLAbP3i1PgxQKBgQD4lxY71mWwgif1gNB+\nZlZ4g9yc1VCTl+DBYK7GHPliiiB3IE2g9VFlESQ0NppljbJuqScSJLatDb5Af1nB\nH4Y+VBD36aXWQuzwqRwxuqy5lvHXEDc16CCYvwdbX2fz6skNn8p+mrtXTWUAvnvV\n/wyplHUsDUjkmxolTg7hDjxUvQKBgQDlZvYzp7esNPlYB7V15rJlKA+50ezHut6s\nS90U4Nzx3Exw7ePXVgji+DvVyl8G13vJeGaOcUBiIH79gjtqINwUg9tYfewWSL1E\nw9yMKv8c5j6j1io/zlLS2eNU5FCWwDHPc3iDF7/YU4bCE80RULaKoihDOk9UoDxm\nCaxA7sXZ9wKBgDNFjjtnO/AM2EsFd3sqhlky8TSTtpvKbnvUAhgwb6tIS+vmCLzS\n/Ce5QltWi7+4Wv4B+2H9moPU2tGYsp1ncBu44QsQ8Lhhc1crufnzw54/qL+vw4Nl\nzhtTAyRwaBNh8HfT5kL4jP0zpEpj/0yi3yy2xvgAAXHNH7ZkBCOc+QqNAoGAeAJm\nOF28U8Wez/OwdY6LsynDGFX/Bfn3tbE2Zk7Ap3K1Nrrs3+EtYvez7cMh9WVTZ/Gp\nzUjoAq23YY344StxlvXoESJHGN1Szp+cSGPR9F9rU7Cdh6W7ZH0CVY3frw26wSlK\nWWJaRaRksjFDrZRI+rucTpc5my78ifDzgUColr8CgYBpgD0p66DAI3J0jw41mvjv\nU5K4cBrOiOnlWYFvSSWbysWTzWq/jxKdjNd3xS2XVbHAH3F4gIOpnWSxqIswD2Pg\nYFPMLZllxtY6JYSxD56MSm2BXR7GfDYx0T43u5iXcwBWYESwnUsbnpWZ1Zvg+Ez4\nhLBFe9FfNLX5UzsXVHbJVQ==\n-----END PRIVATE KEY-----\n`
      }
    }
  );
  
  
  const bucket = storage.bucket("gs://kekk-c40d0.appspot.com");

/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
 const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No image file');
      }
      let newFileName = `${Date.now()}`;
  
      let fileUpload = bucket.file(newFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('error', (error) => {
        console.log(error);
        reject('Something is wrong! Unable to upload at the moment.');
      });
  
      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
         const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
         resolve(url);
      });
  
      blobStream.end(file.buffer);
    });
  }

  exports.uploadImageToStorage = uploadImageToStorage; 