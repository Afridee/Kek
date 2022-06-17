const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {validateArticle} = require('../validations/validateArticle');
const {validateArticleQuery} = require('../validations/validateArticleQuery');
const {validateComment} = require('../validations/validateComment');



router.post('/create',async  (req, res) => {

    const { error } = validateArticle(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const db = fs.firestore(); 
        const data = {
           "title" : req.body.title,
           "subject": req.body.subject,
           "body": req.body.body,
           "writtenBy" : req.body.uid,
           "tags": req.body.tags,
           "likes": [],
           "comments" : [] 
        };
        db.collection("Articles").add(data);
        res.status(200).send(data); 
      }catch(ex){
        console.log(ex);
        res.status(400).send({
          "error" : ex.message
        });
      }
})


router.post('/getArticles',async  (req, res) => {

  const { error } = validateArticleQuery(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const db = fs.firestore();

  const query = db.collection("Articles").where('tags', 'array-contains-any', req.body.tags);
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

router.post('/LikeorUnlikeArticle/:articleId/:userId',async  (req, res) => {

  try{
      const db = fs.firestore(); 

      await db.collection("Articles").doc(req.params.articleId).get().then(article => {
            
        if(article.exists){
                let ArticleList = article.data()['likes'];
                let responseString = "Successfully liked";

                if(!ArticleList.includes(req.params.userId)){
                   ArticleList.push(req.params.userId);
                }else{
                   var index = ArticleList.indexOf(req.params.userId);
                   ArticleList.splice(index, 1);
                   responseString = "Successfully unliked"; 
                }

                const data = {
                  "likes" : ArticleList
                };
                
                db.collection("Articles").doc(req.params.articleId).update(data);
                res.status(200).send(responseString);

            }else{
                res.status(400).send({
                    "error" : "Article doesn't exist"
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

router.post('/Comment/:articleId',async  (req, res) => {

  const { error } = validateComment(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try{
      const db = fs.firestore(); 
      await db.collection("Articles").doc(req.params.articleId).get().then(article => {         
        if(article.exists){
                let commentList = article.data()['comments'];
                commentList.push({
                 "name" : req.body.name,
                 "id" : req.body.id,
                 "comment" : req.body.comment 
                });
                const data = {
                  "comments" : commentList
                };              
                db.collection("Articles").doc(req.params.articleId).update(data);
                res.status(200).send("Comment Posted.");
            }else{
                res.status(400).send({
                    "error" : "Article doesn't exist"
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

router.get('/tags',async  (req, res) => {
  res.status(200).send(["Motivational","Discrimination","Racism","Success Story"]);
})


module.exports = router;