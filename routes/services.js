const express = require('express');
const fs = require('firebase-admin');
const router = express.Router();
const {uploadImageToStorage} = require('../functions/uploadImageToStorage');
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // no larger than 2mb, you can change as needed.
    files: 1, 
  },
});
const upload = multer.single('file');
const {validateService} = require('../validations/validateService');



router.post('/addAService/',async (req, res) => {

  const { error } = validateService(req.query); 
  if (error) return res.status(400).send(error.details[0].message);

  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send({ error: err.message })
    }else{
      const db = fs.firestore();
      let file = req.file;
      if (file) 
      {
           uploadImageToStorage(file, `${Math.floor((Math.random() * 1000000000000000000) + 1)}`).then((fileLink) => {
            //sets the data:  
            data = {
              "providedBy" : req.query.providedBy,
              "nameOfService": req.query.nameOfService,
              "description" : req.query.description,
              "pic" : fileLink,
            };
            //updates database:
            db.collection("Services").doc().set(data);
            //sends response:
            res.status(200).send({
              "message" : "successfully uploaded"
            });
            }).catch((error) => {
              console.error(error);
              return res.status(400).send({ error: error.message })
            });
        }
        else{
              return res.status(400).send({ error: "where is the file bruh?" })
        }
    }
  });
})

router.get('/getMyServices/:uid',async  (req, res) => {

  const db = fs.firestore();

  const query = db.collection("Services").where('providedBy', '==', req.params.uid);
  let serviceList = [];
  query.get().then(snapshot => {
      snapshot.forEach(service => {
        serviceList.push({"id" : service.id,"data" : (service.data())});
      });
      res.status(200).send(serviceList);
    })
    .catch(error => {
      console.error(error);
        res.status(400).send({
          "error" : error.message
        });
    });
})

router.delete('/deleteService/:serviceId',async  (req, res) => {

  const db = fs.firestore();
  console.log("strtes...");
  await db.collection('Services').doc(req.params.serviceId).delete().catch(error => {
    console.error(error);
    res.status(400).send({
      "error" : error.message
    });
  });
  res.status(200).send({
    "message" : "successfully deleted"
  });
})


module.exports = router