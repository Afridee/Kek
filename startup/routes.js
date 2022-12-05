const express = require('express');
const driver = require('../routes/driver');
const authentication = require('../routes/authentication');
const article = require('../routes/article');
const brandjob = require('../routes/brandjob');
const rideRequests = require('../routes/riderequests');
const stripe = require('../routes/stripe');
const services = require('../routes/services');
const fs = require('firebase-admin');
const {initializeApp} = require("firebase/app");

const firebaseConfig = {
  apiKey: process.env.firebaseapiKey,
  authDomain: process.env.firebaseauthDomain,
  databaseURL: process.env.firebasedatabaseURL,
  projectId: process.env.firebaseprojectId,
  storageBucket: process.env.firebasestorageBucket,
  messagingSenderId: process.env.firebasemessagingSenderId,
  appId: process.env.firebaseappId,
  measurementId: process.env.firebasemeasurementId
};


const serviceAccount = {
    "type": "service_account",
    "project_id": "kekk-c40d0",
    "private_key_id": "cfa1ae9691908eb410fba4dd2fe245ca681f77b6",
    "private_key": `-----BEGIN PRIVATE KEY-----\n${process.env.firebaseAdminPrivate_1}\n${process.env.firebaseAdminPrivate_2}\n4rglIJW91UNDOuoPJhn1g9/xGzfhDVUo3wY7PTTac1AluULBPVnYnmmWc8PvKFXs\nOsj8N+sR96HDaKCAqVQWlYuZue8PQwY5E2U2uO9w39A4lQ8Ku5IMnvuX3FKxl/2M\nKQJFyaHscxlHREjl0Cb/GtL+ErsvI1uvKvpijhoTyndGYE6FNI3ySxDU8UfI/vBt\n1PhjYC287j1ozx/TKORWU4GRf4yLGDvuTUolQobbmH831+TseAI3vT5n6Q6KwjgC\nVqrLevdbAgMBAAECggEAMXUkhBxYdnB85pnngGkgwSnad/CGC+Uui6xn1nDSDFzf\nk4YjKelEEDiY/ISpTxIlk0TzrAeS1Pt62uviU4fpBxUu0mHlrohYkhx932OaI/LY\nWfMuSH+92NRqUn3P1uR+qqv9KGS6d0I+1Wx1zB3EKKCQvzhfDkHKBBueu3o/G+Vs\n/7H7Y0nTKT8ld95aowxmpON04GGC7YFqbAzRuFVJ/HwqeI/3VZve7TLTxfHU/tzY\n0GvDkLtmNXIF6YKqaXC9o4yu73mQ4cyKmlXK/LbJ+kJwyZF8h9Q4ouD/O2P4RCBx\nO3OMg0ND2CiayXeWUjEIXdKIo5WeznvLAbP3i1PgxQKBgQD4lxY71mWwgif1gNB+\nZlZ4g9yc1VCTl+DBYK7GHPliiiB3IE2g9VFlESQ0NppljbJuqScSJLatDb5Af1nB\nH4Y+VBD36aXWQuzwqRwxuqy5lvHXEDc16CCYvwdbX2fz6skNn8p+mrtXTWUAvnvV\n/wyplHUsDUjkmxolTg7hDjxUvQKBgQDlZvYzp7esNPlYB7V15rJlKA+50ezHut6s\nS90U4Nzx3Exw7ePXVgji+DvVyl8G13vJeGaOcUBiIH79gjtqINwUg9tYfewWSL1E\nw9yMKv8c5j6j1io/zlLS2eNU5FCWwDHPc3iDF7/YU4bCE80RULaKoihDOk9UoDxm\nCaxA7sXZ9wKBgDNFjjtnO/AM2EsFd3sqhlky8TSTtpvKbnvUAhgwb6tIS+vmCLzS\n/Ce5QltWi7+4Wv4B+2H9moPU2tGYsp1ncBu44QsQ8Lhhc1crufnzw54/qL+vw4Nl\nzhtTAyRwaBNh8HfT5kL4jP0zpEpj/0yi3yy2xvgAAXHNH7ZkBCOc+QqNAoGAeAJm\nOF28U8Wez/OwdY6LsynDGFX/Bfn3tbE2Zk7Ap3K1Nrrs3+EtYvez7cMh9WVTZ/Gp\nzUjoAq23YY344StxlvXoESJHGN1Szp+cSGPR9F9rU7Cdh6W7ZH0CVY3frw26wSlK\nWWJaRaRksjFDrZRI+rucTpc5my78ifDzgUColr8CgYBpgD0p66DAI3J0jw41mvjv\nU5K4cBrOiOnlWYFvSSWbysWTzWq/jxKdjNd3xS2XVbHAH3F4gIOpnWSxqIswD2Pg\nYFPMLZllxtY6JYSxD56MSm2BXR7GfDYx0T43u5iXcwBWYESwnUsbnpWZ1Zvg+Ez4\nhLBFe9FfNLX5UzsXVHbJVQ==\n-----END PRIVATE KEY-----\n`,
    "client_email": "firebase-adminsdk-qe244@kekk-c40d0.iam.gserviceaccount.com",
    "client_id": "106854064105819562225",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qe244%40kekk-c40d0.iam.gserviceaccount.com"
  };

// Initialize Firebase-admin  
fs.initializeApp({
  credential: fs.credential.cert(serviceAccount)
 });

// Initialize Firebase
const app = initializeApp(firebaseConfig); 

module.exports = function(app){
    app.use(express.json());
    app.use('/api/driver', driver);
    app.use('/api/authentication', authentication);
    app.use('/api/article', article);
    app.use('/api/brandjob', brandjob);
    app.use('/api/rideRequests', rideRequests);
    app.use('/api/stripe', stripe);
    app.use('/api/services', services);
}