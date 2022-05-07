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
    files: 1, 
  },
});
const upload = multer.single('file');

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
          "Driverlicensepicture" : "null",
          "Insurancepicture" : "null",
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


//the serial goes like this:
//first pic : Driver license picture  
//second pic : Insurance picture 
//third pic : Vehicle registration picture

router.post('/uploadDriverLicense/:uid',async (req, res) => {
      const db = fs.firestore();

      db.collection("Drivers").doc(req.params.uid).get().then(driver => {
        if(driver.exists){
          upload(req, res, function (err) {
            if (err) {
              return res.status(400).send({ error: err.message })
            }
            else{
                let file = req.file;
                if (file) 
                {
                     uploadImageToStorage(file, `${req.params.uid}_DriverLicense`).then((fileLink) => {
                      //sets the data:  
                      data = {
                        //changes will be made here: 
                        "Driverlicensepicture" : fileLink,
                      };
                      //updates database:
                      db.collection("Drivers").doc(req.params.uid).update(data);
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
        }else{
          res.status(400).send({
            "error" : "Driver doesn't exist"
          });
        }
      })
});

router.post('/uploadInsurance/:uid',async (req, res) => {
  const db = fs.firestore();

  db.collection("Drivers").doc(req.params.uid).get().then(driver => {
    if(driver.exists){
      upload(req, res, function (err) {
        if (err) {
          return res.status(400).send({ error: err.message })
        }
        else{
            let file = req.file;
            if (file) 
            {
                 uploadImageToStorage(file, `${req.params.uid}_Insurance`).then((fileLink) => {
                  //sets the data:  
                  data = {
                    //changes will be made here: 
                    "Insurancepicture" : fileLink,
                  };
                  //updates database:
                  db.collection("Drivers").doc(req.params.uid).update(data);
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
    }else{
      res.status(400).send({
        "error" : "Driver doesn't exist"
      });
    }
  })
});

router.post('/uploadVehicleregistration/:uid',async (req, res) => {
  const db = fs.firestore();

  db.collection("Drivers").doc(req.params.uid).get().then(driver => {
    if(driver.exists){
      upload(req, res, function (err) {
        if (err) {
          return res.status(400).send({ error: err.message })
        }
        else{
            let file = req.file;
            if (file) 
            {
                 uploadImageToStorage(file, `${req.params.uid}_Vehicleregistration`).then((fileLink) => {
                  //sets the data:  
                  data = {
                    //changes will be made here: 
                    "Vehicleregistrationpicture" : fileLink,
                  };
                  //updates database:
                  db.collection("Drivers").doc(req.params.uid).update(data);
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
    }else{
      res.status(400).send({
        "error" : "Driver doesn't exist"
      });
    }
  })
});



module.exports = router;