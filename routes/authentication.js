const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateSignUp} = require('../validations/validateSignUp');
const {validateSignIn} = require('../validations/validateSignIn');
const {validateAccessToken} = require('../validations/validateAccessToken');
// Import the functions you need from the SDKs you need
const {initializeApp} = require("firebase/app");
const {getAuth, signInWithEmailAndPassword} = require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);

router.post('/signUp',async  (req, res) => {

  const { error } = validateSignUp(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  fs.auth().createUser({
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        displayName: req.body.displayName,
    })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.uid);
      res.status(200).send({"userRecord" : userRecord}); 
    })
    .catch((error) => {
      console.log('Error creating new user:', error);
      res.status(500).send({
        "error" : error.message
      });
    });
});

router.post('/signIn',async  (req, res) => {

  const { error } = validateSignIn(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const auth = getAuth();
  let customTkn = "...";
  signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      const user = userCredential.user;
      res.status(200).send({"loginDetails" : user, "customToken" : customTkn}); 
    })
    .catch((error) => {
      res.status(500).send({
        "error" : error.message
      });
    });
});

router.post('/verifyToken',async  (req, res) => {

  const { error } = validateAccessToken(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  fs.auth()
  .verifyIdToken(req.body.accessToken)
  .then((decodedToken) => {
    console.log(decodedToken);
    res.status(200).send({"decodedToken" : decodedToken}); 
  })
  .catch((error) => {
    console.log(error.message);
    res.status(500).send({
      "error" : error.message
    });
  });
}); 

module.exports = router;