const express = require('express');
const fs = require('firebase-admin');
const router = express.Router();
const {validateCreateCustomer} = require('../validations/validateCreateCustomer');
const {validateCardInfo} = require('../validations/validateCardInfo');
const {validateRidePayment} = require('../validations/validateRidePayment');
const {validateSelfPromotion} = require('../validations/validateSelfPromotion');
const {validatebusinessPromotion} = require('../validations/validatebusinessPromotion');
const stripe = require('stripe')(process.env.stripe_sk);
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


router.post('/createCustomer',async  (req, res) => {

        const { error } = validateCreateCustomer(req.body); 
        if (error) return res.status(400).send(error.details[0].message);

        stripe.customers.create({
        name: req.body.name,    
        email: req.body.email,
        phone: req.body.phone
        }).then(async (customer) => {
            const db = fs.firestore(); 
            await db.collection("Users").doc(req.body.uid).get().then(User => {
                if(User.exists){
                    const data = {
                        //changes will be made here: 
                        "stipeCustomerId" : customer.id,
                     };
                    db.collection("Users").doc(req.body.uid).update(data); 
                    res.status(200).send("successfully Updated");
                }else{
                    res.status(400).send({"error" : "User doesn't exist"})
                }
            });
        })
        .catch(error => res.status(400).send({"error" : error.raw.code}));
});


router.get('/getMyStripeCustomerId/:uid',async  (req, res) => {
    const db = fs.firestore(); 
    await db.collection("Users").doc(req.params.uid).get().then(User => {
        if(User.exists){
            res.status(200).send({"stipeCustomerId" : User.data().stipeCustomerId});
        }else{
            res.status(400).send({"error" : "User doesn't exist"})
        }
    });
})

router.post('/attachCardToCustomer',async  (req, res) => {

    const { error } = validateCardInfo(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    //testing data:
    //  {
    //     type: 'card',
    //     card: {
    //     number: '4242424242424242',
    //     exp_month: 7,
    //     exp_year: 2023,
    //     cvc: '314',
    //     },
    // }

    await stripe.paymentMethods.create({
        type: 'card',
        card: {
        number: req.body.cardNumber,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
        },
    })
    .then(async (paymentMethod) => {
       await stripe.paymentMethods.attach(
            paymentMethod.id,
            {customer: req.body.cus_id}
        )
        .then( attachedPaymentMethod => res.status(200).send({"PaymentMethod" : attachedPaymentMethod}))
        .catch(error => res.status(400).send({"error" : error.raw.code}));    
    })
    .catch(error => res.status(400).send({"error" : error.raw.code})); 
});

router.post('/detachCardFromCustomer/:paymentMethodID',async  (req, res) => {
     try{
          const paymentMethod = await stripe.paymentMethods.detach(
            req.params.paymentMethodID
          );
          res.status(200).send("Successfully removed");
     }catch(error){
        res.status(400).send({"error" : error.raw.code});
     }
});

router.get('/getCustomerPaymentMethods/:cus_id',async  (req, res) => {
      await stripe.customers.listPaymentMethods(
        req.params.cus_id,
        {type: 'card'}
      )
      .then(paymentMethods => res.status(200).send({"PaymentMethods" : paymentMethods}))
      .catch(error => res.status(400).send({"error" : error.raw.code}));
});

//testing data:
// amount: 2000, this is 20 usd
//  currency: 'usd',
//   payment_method_types: ['card'],
router.post('/payForRide',async  (req, res) => {

        const { error } = validateRidePayment(req.body); 
        if (error) return res.status(400).send(error.details[0].message);

        const db = fs.firestore(); 
        await db.collection("RideRequests").doc(req.body.requestId).get().then(RideRequest => {
            if(RideRequest.exists && !RideRequest.data().paid){
                //create a payment intent:
                stripe.paymentIntents.create({
                receipt_email : req.body.email,
                description: `for ride request:${req.body.requestId}`,   
                customer: req.body.cus_id,
                amount: RideRequest.data().suggestedPrice*100,
                currency: 'usd',
                payment_method_types: ['card'],
                }).then(paymentIntent => {
                    stripe.paymentIntents.confirm(
                        paymentIntent.id,
                        {payment_method: req.body.paymentMethodId}
                    ).then(async confirmPaymentIntent => {
                        const data = {
                            //changes will be made here: 
                            "paid" : true,
                         };
                        await db.collection("RideRequests").doc(req.body.requestId).update(data); 
                        res.status(200).send({"confirmPaymentIntent" : confirmPaymentIntent})
                    })
                    .catch(error => res.status(400).send({"error" : error.raw.code}));
                })
                .catch(error => res.status(400).send({"error" : error.raw.code}));
            }else{
                res.status(400).send({"error" : "this RideRequest doesn't exist or it's already paid for."})
            }
        }).catch(error => res.status(400).send({"error" : error}));
});

router.post('/payToPromoteYourself',async  (req, res) => {

    ///todo: validate post request...
    const { error } = validateSelfPromotion(req.query); 
    if (error) return res.status(400).send(error.details[0].message);

    console.log(req.query);

    const db = fs.firestore(); 

    upload(req, res, function (err) {
      if (err) {
        return res.status(400).send({ error: err.message })
      }
      else{
          let file = req.file;
          if (file) 
          {    
            stripe.paymentIntents.create({
              receipt_email : req.query.email,
              description: `for promoting thyself : ${req.query.name}`,   
              customer: req.query.cus_id,
              amount: req.query.amount*100,
              currency: 'usd',
              payment_method_types: ['card'],
              }).then(paymentIntent => {
                  stripe.paymentIntents.confirm(
                      paymentIntent.id,
                      {payment_method: req.query.paymentMethodId}
                  ).then(async confirmPaymentIntent => {
                    uploadImageToStorage(file, `${Math.floor((Math.random() * 1000000000000000000) + 1)}`).then(async (fileLink) => {
                          const data = {
                            "name" : req.query.name,
                            "about" : req.query.about,
                            "pic" : fileLink,
                          };
                          await  db.collection("selfPromotions").doc().set(data);
                          res.status(200).send({"confirmPaymentIntent" : confirmPaymentIntent})
                      }).catch((error) => {
                        console.error(error);
                        return res.status(400).send({ error: error.message })
                      });
    
                  })
                  .catch(error => res.status(400).send({"error" : error}));
              })
              .catch(error => res.status(400).send({"error" : error}));
            }
            else{
                  return res.status(400).send({ error: "where is the file bruh?" })
            }
      }
    });
});

router.post('/payToPromoteYourBusiness',async  (req, res) => {

  ///todo: validate post request...
  const { error } = validatebusinessPromotion(req.query); 
  if (error) return res.status(400).send(error.details[0].message);

  const db = fs.firestore(); 

  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send({ error: err.message })
    }
    else{
        let file = req.file;
        if (file) 
        {    
          stripe.paymentIntents.create({
            receipt_email : req.query.email,
            description: `for promoting thyself : ${req.query.name}`,   
            customer: req.query.cus_id,
            amount: req.query.amount*100,
            currency: 'usd',
            payment_method_types: ['card'],
            }).then(paymentIntent => {
                stripe.paymentIntents.confirm(
                    paymentIntent.id,
                    {payment_method: req.query.paymentMethodId}
                ).then(async confirmPaymentIntent => {
                  uploadImageToStorage(file, `${Math.floor((Math.random() * 1000000000000000000) + 1)}`).then(async (fileLink) => {
                        const data = {
                          "name" : req.query.name,
                          "about" : req.query.about,
                          "category" : req.query.category,
                          "pic" : fileLink,
                        };
                        await  db.collection("businessPromotions").doc().set(data);
                        res.status(200).send({"confirmPaymentIntent" : confirmPaymentIntent})
                    }).catch((error) => {
                      console.error(error);
                      return res.status(400).send({ error: error.message })
                    });
  
                })
                .catch(error => res.status(400).send({"error" : error}));
            })
            .catch(error => res.status(400).send({"error" : error}));
          }
          else{
                return res.status(400).send({ error: "where is the file bruh?" })
          }
    }
  });
});






module.exports = router;