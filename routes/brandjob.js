const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateArticleQuery} = require('../validations/validateArticleQuery');

router.get('/getSelfPromotions',async  (req, res) => {

    ///todo: validate..
  
    const db = fs.firestore();
  
    const query = db.collection("selfPromotions");
    let articleList = [];
    query.get().then(snapshot => {
        snapshot.forEach(article => {
          articleList.push({"id" : article.id,"data" : (article.data())});
        });
        res.status(200).send(articleList);
      })
      .catch(error => {
        console.error(error);
          res.status(400).send({
            "error" : error.message
          });
      });
  })

  router.get('/getBusinessPromotions/:category',async  (req, res) => {

    ///todo: validate...
  
    const db = fs.firestore();
  
    const query = db.collection("businessPromotions").where('category', '==', req.params.category);
    let articleList = [];
    query.get().then(snapshot => {
        snapshot.forEach(article => {
          articleList.push({"id" : article.id,"data" : (article.data())});
        });
        res.status(200).send(articleList);
      })
      .catch(error => {
        console.error(error);
          res.status(400).send({
            "error" : error.message
          });
      });
  })


module.exports = router;