const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateArticle} = require('../validations/validateArticle');


router.post('/create',async  (req, res) => {

    const { error } = validateArticle(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        const data = {
           "title" : req.body.title,
           "subject": req.body.subject,
           "body": req.body.body,
           "writtenBy" : req.body.uid
        };
        db.collection("Articles").add(data);
        res.status(200).send(data); 
      }catch(ex){
        console.log(ex);
        res.status(500).send({
          "error" : ex.message
        });
      }
}) 


module.exports = router;