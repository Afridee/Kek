const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateDriver} = require('../validations/validateDriver');

router.post('/create',async  (req, res) => {

    const { error } = validateDriver(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        const data = {
           "name" : req.body.name,
           "uid" : req.body.uid
        };
        db.collection("Drivers").doc(req.body.uid).set(data);
        res.status(200).send(data); 
      }catch(ex){
        console.log(ex);
        res.status(500).send({
          "error" : ex.message
        });
      }
}) 

module.exports = router;