const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateSignUp} = require('../validations/validateSignUp');
const {validateSignIn} = require('../validations/validateSignIn');
const {validateAccessToken} = require('../validations/validateAccessToken');
const {validateCustomToken} = require('../validations/validateCustomToken');
// Import the functions you need from the SDKs you need
const {getAuth, signInWithEmailAndPassword, signInWithCustomToken} = require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

router.post('/signUp',async  (req, res) => {

  const { error } = validateSignUp(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let customTkn = "...";

  fs.auth().createUser({
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        displayName: req.body.displayName,
    })
    .then((userRecord) => {
      const data = {
        "email": req.body.email,
        "phoneNumber": req.body.phoneNumber,
        "password": req.body.password,
        "displayName": req.body.displayName,
        "uid" : userRecord.uid
      };
      fs.auth()
      .createCustomToken(userRecord.uid)
      .then((customToken) => {
        customTkn = customToken;
        const db = fs.firestore(); 
        db.collection("Users").doc(userRecord.uid).set(data);
        res.status(200).send({"userRecord" : userRecord, "customToken" : customTkn});
      })
      .catch((error) => {
        const db = fs.firestore(); 
        db.collection("Users").doc(userRecord.uid).set(data);
        res.status(200).send({"userRecord" : userRecord, "customToken" : customTkn});
      });  
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
      fs.auth()
      .createCustomToken(userCredential.user.uid)
      .then((customToken) => {
        customTkn = customToken;
        const user = userCredential.user;
        res.status(200).send({"loginDetails" : user, "customToken" : customTkn});
      })
      .catch((error) => {
        const user = userCredential.user;
        res.status(200).send({"loginDetails" : user, "customToken" : customTkn});
      }); 
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



router.post('/signInWithCustomToken',async  (req, res) => {

  const { error } = validateCustomToken(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const auth = getAuth();
  signInWithCustomToken(auth, req.body.customToken)
  .then((userCredential) => {
    var user = userCredential.user;
    res.status(200).send({"loginDetails" : user});
  })
  .catch((error) => {
    res.status(500).send({
      "error" : error.message
    });
  });
}); 

module.exports = router;