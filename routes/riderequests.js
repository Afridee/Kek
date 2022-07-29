const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateRideRequestCreation} = require('../validations/validateRideRequestCreation');
const {validateRideRequestAcceptance} = require('../validations/validateRideRequestAcceptance');
const {validateGetEstimatedPrice} = require('../validations/validategetEstimatedPrice');
const {calcCrow} = require('../functions/distanceCalculator');

router.post('/create',async  (req, res) => {

    const { error } = validateRideRequestCreation(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        const data = {
           "requestedBy" : {
              "uid" : req.body.requestedBy.uid,
              "displayName" : req.body.requestedBy.displayName,
              "email" :  req.body.requestedBy.email,
              "phoneNumber" : req.body.requestedBy.phoneNumber,
           }, //takes requester's UID 
           "accepted" : false,
           "paid" : false,
           "cancelled": false,
           "driver" : null,
           "pickUpFrom" : req.body.pickUpFrom,
           "destination" : req.body.destination,
           "estimatedPrice": req.body.estimatedPrice,
           "suggestedPrice": req.body.suggestedPrice,
           "priceSuggested": req.body.suggestedPrice>0,
           "timeOfRequest" : Date.now()//Assuming that this timestamp is in milliseconds
        };
        db.collection("RideRequests").add(data);
        res.status(200).send(data); 
      }catch(ex){
        console.log(ex);
        res.status(400).send({
          "error" : ex.message
        });
      }
}); 


router.get('/getRequests',async  (req, res) => {
    const db = fs.firestore();
    let now = new Date();
    let fireHoursTillNow = now.setHours(now.getHours() - 5);
    console.log("fireHoursTillNow: ", fireHoursTillNow);
    const query = db.collection("RideRequests").where('accepted','==',false).where('timeOfRequest', '>', fireHoursTillNow);
    let requestList = [];
    query.get().then(snapshot => {
        snapshot.forEach(RideRequest => {
          console.log(RideRequest.id, ' => ', RideRequest.data());
          requestList.push({"requestId" : RideRequest.id,"data" : (RideRequest.data())});
        });
        res.status(200).send(requestList);
      })
      .catch(error => {
        console.error(error);
          res.status(400).send({
            "error" : error.message
          });
      });
});

router.get('/getMyRequests/:uid',async  (req, res) => {
  const db = fs.firestore();
  let now = new Date();
  let fireHoursTillNow = now.setHours(now.getHours() - 5);
  console.log("fireHoursTillNow: ", fireHoursTillNow);
  const query = db.collection("RideRequests").where('timeOfRequest', '>', fireHoursTillNow);
  let requestList = [];
  query.get().then(snapshot => {
      snapshot.forEach(RideRequest => {
        if(RideRequest.data().requestedBy.uid == req.params.uid || RideRequest.data().driver.uid == req.params.uid){
          requestList.push({"requestId" : RideRequest.id,"data" : (RideRequest.data())});
        }
      });
      res.status(200).send(requestList);
    })
    .catch(error => {
      console.error(error);
        res.status(400).send({
          "error" : error.message
        });
    });
});

router.post('/cancelRequest',async  (req, res) => {

    const { error } = validateRideRequestAcceptance(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        await db.collection("RideRequests").doc(req.body.requestId).get().then(RideRequest => {
             if(RideRequest.exists && RideRequest.data().accepted == true && RideRequest.data().driver.uid == req.body.driverUID){
              const data = {
                //changes will be made here: 
                "cancelled" : true,
             };
            db.collection("RideRequests").doc(req.body.requestId).update(data); 
            res.status(200).send("successfully Updated");
             }
             else{
                res.status(400).send({
                    "error" : "Ride Request doesn't exist or request not accepted yet or request is being cancelled by a different driver"
                  });
             } 
        });
      }catch(ex){
        console.log(ex);
        res.status(400).send({
          "error" : ex.message
        });
      }
}); 

router.post('/acceptRequest',async  (req, res) => {

  const { error } = validateRideRequestAcceptance(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try{
      const db = fs.firestore(); 

      await db.collection("RideRequests").doc(req.body.requestId).get().then(RideRequest => {
           if(RideRequest.exists && RideRequest.data().accepted == false){
              db.collection("Drivers").doc(req.body.driverUID).get().then(driver => {
                 if(driver.exists){
                  const data = {
                      //changes will be made here: 
                      "accepted" : true,
                      "driver" : driver.data()
                   };
                  db.collection("RideRequests").doc(req.body.requestId).update(data); 
                  res.status(200).send("successfully Updated");
                 }else{
                  res.status(400).send({
                      "error" : "Driver doesn't exist"
                    }); 
                 }
              })
           }else{
              res.status(400).send({
                  "error" : "Ride Request doesn't exist or request already taken by another driver"
                });
           } 
      });
    }catch(ex){
      console.log(ex);
      res.status(400).send({
        "error" : ex.message
      });
    }
});

router.post('/getEstimatedPrice',async  (req, res) => {

  const { error } = validateGetEstimatedPrice(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const price = 70.577777; //rate per kilometer
  const s = calcCrow(req.body.lat1, req.body.lon1, req.body.lat2, req.body.lon2); //distance in kilometer
  res.status(200).send({"estimatedPrice": (s*price).toFixed(2), "distanceIn" : "km"});
})

module.exports = router;