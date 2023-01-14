const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const { validateSideHustle} = require('../validations/validateSideHustle');
const { validateComment } = require('../validations/validateComment');

router.post('/create', async (req, res) => {
  
  const { error } = validateSideHustle(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const db = fs.firestore();
    const data = {
      title: req.body.title,
      subject: req.body.subject,
      body: req.body.body,
      writeruid: req.body.uid,
      writername: req.body.name,
      category: req.body.category,
      comments: [],
    };
    db.collection('Sidehustles').add(data);
    res.status(200).send(data);
  } catch (ex) {
    console.log(ex);
    res.status(400).send({
      error: ex.message,
    });
  }
});

router.post('/getHustles', async (req, res) => {
  // const { error } = validateArticleQuery(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  const db = fs.firestore();

  const query = db
    .collection('Sidehustles')
    .where('category', 'array-contains-any', req.body.category);
  let articleList = [];
  query
    .get()
    .then((snapshot) => {
      snapshot.forEach((article) => {
        articleList.push({ id: article.id, data: article.data() });
      });
      res.status(200).send(articleList);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send({
        error: error.message,
      });
    });
});

router.post('/Comment/:articleId', async (req, res) => {

  const { error } = validateComment(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const db = fs.firestore();
    await db
      .collection('Sidehustles')
      .doc(req.params.articleId)
      .get()
      .then((article) => {
        if (article.exists) {
          let commentList = article.data()['comments'];
          commentList.push({
            name: req.body.name,
            id: req.body.id,
            comment: req.body.comment,
          });
          const data = {
            comments: commentList,
          };
          db.collection('Sidehustles').doc(req.params.articleId).update(data);
          res.status(200).send('Comment Posted.');
        } else {
          res.status(400).send({
            error: "Article doesn't exist",
          });
        }
      });
  } catch (ex) {
    console.log(ex);
    res.status(400).send({
      error: ex.message,
    });
  }
});

router.get('/categories', async (req, res) => {
  res
    .status(200)
    .send([
      'Find Paying Passengers for your vehicle',
      'Find Social Media Promotion Work',
      'Halal investors for bussiness',
      'Find partners to buy real estate the halal way',
      'Muslim owned halal bussiness',
      'Halal restaurants',
      'Academic Help',
      'Help with house chores',
      'Islamic Tutors/Professionals',
      'Find/Be Traveling Partner',
      'Taking care of babies/elderly/ill',
      'Charity',
      'Sell anything',
      'Rent anything at your own risk with supervision',
      'Construction Workers',
      'Help with furniture building/Moving Furnitures',
      'Find protesters',
      'Pay/Get paid to eat with you',
      'Find Muslim Friends',
      'Pay/get paid to play sports with you',
      'Beautician/Stylish/Home makeover',
      'Vehicle Makeover',
      'Pet/Plant Care',
      'Top/cheap Hangout Places',
      'Barter : Exchange something for something',
      'Muslim Rent Post',
      'Find partners to buy graveyards',
      'Pooling money togather',
      'Suggestions on interested topics',
      'Others',
    ]);
});

module.exports = router;
