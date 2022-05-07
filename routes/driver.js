const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const Multer = require('multer');
const {validateDriver} = require('../validations/validateDriver');
const {uploadImageToStorage} = require('../functions/uploadImageToStorage');
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
    files: 3, 
  },
});
const upload = multer.array('file');

router.post('/enrol',async  (req, res) => {

    const { error } = validateDriver(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        const data = {
          "name" : req.body.name,
          "uid" : req.body.uid,
          "Driverexpirationdate" : req.body.Driverexpirationdate,
          "Insurancepolicyexpirationdate" : req.body.Insurancepolicyexpirationdate,
          "Vehicleregistrationnumber" : req.body.Vehicleregistrationnumber,
          "Vehicleregistrationexpirationdate" : req.body.Vehicleregistrationexpirationdate,
          "Socialsecuritynumber" : req.body.Vehicleregistrationexpirationdate,
          "Driverlicensepicture " : "null",
          "Insurance picture" : "null",
          "Vehicleregistrationpicture" : "null"
        };
        db.collection("Drivers").doc(req.body.uid).set(data);
        res.status(200).send(data); 
      }catch(ex){
        console.log(ex);
        res.status(500).send({
          "error" : ex.message
        });
      }
}); 


router.post('/uploadDriverDocs/:uid', (req, res) => {
      
      //the serial goes like this:
      //first pic : Driver license picture  
      //second pic : Insurance picture 
      //third pic : Vehicle registration picture
      const db = fs.firestore();

      db.collection("Drivers").doc(req.params.uid).get().then(driver => {
        if(driver.exists){
          upload(req, res, function (err) {
            if (err) {
              return res.status(400).send({ error: err.message })
            }else{
              if(req.files != null && req.files.length==3){ 
              for(let i=0;i<req.files.length;i++){
                let file = req.files[i];
                if (file) {
                      uploadImageToStorage(file).then((fileLink) => {
                      console.log(i);  
                      data = {};
                      if(i==0){
                            data = {
                              //changes will be made here: 
                              "Driverlicensepicture " : fileLink,
                      };
                      }else if(i==1){
                            data = {
                              "Insurancepicture" : fileLink,
                            };
                      }else if(i==2){
                            data = {
                              "Vehicleregistrationpicture" : fileLink
                            };
                      }
                      db.collection("Drivers").doc(req.params.uid).update(data);
                      }).catch((error) => {
                        console.error(error);
                      });
                }
              }
              res.status(200).send({
                "message" : "successfully uploaded"
              });
            }else{
              res.status(400).send({
                "error" : "dafq!! You were suppose to upload 3 files"
              });
            }
          }
            });
        }else{
          res.status(400).send({
            "error" : "Driver doesn't exist"
          });
        }
      })
});


module.exports = router;