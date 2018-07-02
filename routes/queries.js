var express = require('express');
var router = express.Router();
var promise = require('bluebird');
var response = require('../helpers/response');
var bcrypt = require('bcryptjs');
var validateEmail = require('../helpers/userHelper');
var nodemailer = require('nodemailer');
var config = require('../config/config');
var jwt = require('jsonwebtoken');
var returnUrl = 'https://gentle-island-70227.herokuapp.com/login';
var authentication = require('../config/authenticate');
var randtoken =require('rand-token') ;
randtoken.generate();

// Initialization Options
var options = {
  promiseLib: promise,
  error: (error, e) => {
    if (e.cn) {
      // A connection-related error;
      //
      // Connections are reported back with the password hashed,
      // for safe errors logging, without exposing passwords.
      console.log('CN: ', e.cn);
      console.log('EVENT', error.message ||  error);
    }
  }
};

var pgp = require('pg-promise')(options);
// var connectionString = 'postgres://postgres:123456@127.0.0.1:5432/japonic3'; //'postgres://username:password@servername:port/databaseName';
var connectionString = 'postgres://postgres:Welkom01@34.243.192.210:5432/Japonic_DEV';
// var connectionString = 'postgres://postgres:Welkom01@127.0.0.1:5432/Japonic_DEV';  
//'postgres://username:password@servername:port/databaseName';
var db = pgp(connectionString,function(err){
  if(err) {
    console.log(err,"error on connecting db");
  }
  else{
    console.log("Database Connected!")
  }

});
router.get('/', (req, res) => {
  res.json({ sessionID: 'req.sessionID', session: 'req.session' });
});

router.get('/companies', (req, res) => {
  
  db.any('SELECT t1.name FROM auctions$maker as t1 INNER JOIN auctions$lot as t2 ON t1.name=t2.company_en WHERE t2.result_num = 5  GROUP BY t1.id ORDER BY t1.name ASC')
    .then(function (data) {
      res.json(response.result(data, 1, "successfully retrieved companies"));
    })
    .catch(function (err) {
      return res
        .status(404)
        .json(response.result({}, 0, err));
    });
});

router.get('/models', (req, res) => {
  var makerName = req.query.company_name;
  
  // SELECT T4.* FROM (SELECT * FROM auctions$maker T1 LEFT JOIN auctions$model_maker T2 ON T1.id = T2.auctions$makerid WHERE T1.name='NISSAN'  ) AS T3 LEFT JOIN auctions$model T4 ON T4.ID=T3.auctions$modelid ;
  var queryStr = "SELECT T4.name FROM (SELECT * FROM auctions$maker T1 LEFT JOIN auctions$model_maker T2 ON T1.id = T2.auctions$makerid WHERE T1.name=$/makerName/ ) AS T3 LEFT JOIN auctions$model T4 ON T4.ID=T3.auctions$modelid INNER JOIN auctions$lot  T5 ON T5.model_name_en=T4.name AND T5.company_en=T3.name AND T5.result_num = 5 GROUP BY T4.id ORDER BY T4.name ASC ";
  var queryDict = {
  };
  if (makerName) {
    queryDict['makerName'] = makerName;
  }else {
    return res
      .status(404)
      .json(response.result({}, 0, 'company name is required'));
  }

  queryStr = queryStr + "";
  var query = pgp.as.format(queryStr, queryDict);
  console.log(query);

  db.any(query)
    .then(function (data) {
      console.log(data);
      res.json(response.result(data, 1, "successfully retrieved models"));
    })
    .catch(function (err) {
      return res
        .status(404)
        .json(response.result({}, 0, err));
    });
});

router.get('/countries',(req,res) => {

  var queryStr = "SELECT * FROM main2$country";
  var query = pgp.as.format(queryStr);
  console.log(query,"query");

  db.any(query)
    .then(function (data) {
      res.json(response.result(data, 1, "successfully retrieved countries"));
    })
    .catch(function (err) {
      return res
        .status(404)
        .json(response.result({}, 0, err));
    });

});

router.get('/region',(req,res) => {

  var queryStr = "SELECT * FROM main2$region";
  var query = pgp.as.format(queryStr);
  console.log(query,"query");

  db.any(query)
    .then(function (data) {
      res.json(response.result(data, 1, "successfully retrieved countries"));
    })
    .catch(function (err) {
      return res
        .status(404)
        .json(response.result({}, 0, err));
    });

});



router.post('/registeration', (req,res) => {
  var name = req.body.name;
  var email = req.body.email;
  var language = req.body.language;
  var address = req.body.address;
  var city = req.body.city;
  var unhashed_password = req.body.password;
  var masterCountries = req.body.masterCountries;
  var countryCode = req.body.country;
  var regionCode = req.body.regionCode;

  if(validateEmail.emailValidation(email) ==!true){
    return res
      .status(404)
      .json(response.result({},0,'Email cannot be empty or should be in valid format!'))
  }

  else if(unhashed_password){ 
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(unhashed_password, salt, function(err, hash) {
        if(err) {
          return res
          .status(404)
          .json(response.result({},0,'Error on Hashing Password!'));
        }
        else{
          console.log("IN else");
          let transporter = nodemailer.createTransport(config.smtpConfig);
          var mailOptions = {
                           from: `${config.smtpConfig.auth.user}`,
                           to: `${email}`,
                           subject: 'Account Activation Email',
                           html: `<h1 style="text-align:left; color:#00b9ee;">Welcome To Japonic</h1>
                  <div></div>
                  <br><p style="text-align:left;color:#000; font-size:20px;">
                  <b>Hello, there!</b></p>
                  <p style="text-align:left;color:#000;font-size: 14px;"> 
                  <b>Thanks for creating a Japonic account. To continue please confirm your
                  email address by clicking the button below.</b> </p>
                 <br><div style="display:inline-block;background:#00b9ee; padding:10px;-webkit-border-radius: 10px; -moz-border-radius: 4px; border-radius: 4px;">
                 <a style="text-decoration:none;color:#fff;font-size:15px;"href="`+ returnUrl +`">Activate Your Account</a></div>
                 <br><br>
                 <p style="text-align:left;color:#000; font-size: 14px;">
                  <h4>Thanks,</h4>
                  <h4>Japonic Team</h4>
                 </p>`
                        };
          let password = hash;
          let token = randtoken.generate(16);
          console.log(token,"token");
          var queryStr = `INSERT INTO main2$customer (name,email,password,city,addressline1,preferredlanguage,countrycode,regioncode) VALUES ('${name}','${email}','${password}','${city}','${address}','${language}','${countryCode}','${regionCode}');`;
          console.log(queryStr,"queryStr") ;
          var query = pgp.as.format(queryStr);
          console.log(query,"query") ;
          db.any(query)
          .then((data) => {
            console.log(data,"data at registeration");
            // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                           if (error) {
                              res.status(500).json({
                                 status: false,
                                 error: error.message
                              });
                           } else {
                              res.status(201).json({
                                 status: true,
                                 message: "Account created successfully and verification email is sent to your Account."
                              });
                           }
                        });
            // res.json(response.result(data, 1, "successfully registered user"));
          })
          .catch(function(err) {
            return res
              .status(404)
              .json(response.result({}, 0, err));
          })
        }
    });
  })
};
});

router.post('/login',(req,res)=> {
  var email = req.body.email;
  var password = req.body.password;
  console.log(req.body,"body");

  if(validateEmail.emailValidation(email) ==!true){
    return res
      .status(404)
      .json(response.result({},0,'Email cannot be empty or should be in valid format!'))
  }

  else if(password) {
    var queryStr = "SELECT * FROM main2$customer WHERE email='"+`${email}`+"';";
    var query = pgp.as.format(queryStr);
    console.log(queryStr,"queryStr");
    console.log(query,"query");
    db.any(query)
    .then((data) => {

      if(data.length<1) {
        return res
          .status(404)
          .json(response.result({},0,"Not a registered user!"));
      }
      else{

        bcrypt.compare(password, data[0].password, function(err, result) {
           if(err) {
            console.log(err, "error in compare")
             return res
             .status(404)
             .json(response.result({},0,err));
          }
           else if(!result) {
             return res
               .status(404)
               .json(response.result({},0,'Incorrect Password!'));
           }
           else {
            var payload = {
                        cc: data[0].customercode,
                        email:data[0].email
                     };
            var token;
            token = jwt.sign(payload, config.auth.secret, {
                           expiresIn: '1d'
                        });
            return res
            .status(200)
            .json({
              status:true,
              data:data,
              token:token
            });
           }

        })
      }
    })
  }
});

/*API to fetch list of offers associated with each customer based on customer id*/

router.get('/offers',(req,res)=> {
  console.log(req.query,"req.query");

  var customerCode = parseInt(req.query.cc);
  console.log(customerCode,'customerCode');
   if(customerCode) {
    let queryStr = "SELECT * FROM main2$offer where customercode = "+`${customerCode}`+";";
    console.log(queryStr,"offer queryStr");
    let query = pgp.as.format(queryStr);
    console.log(query,"offer query");
    db.any(query)
    .then((data)=> {
      console.log(data,"offer data");
      if(data.length) {
        return res
        .status(200)
        .json(response.result(data,1,"offer list retrieved"));
      }
      else {
        return res
        .status(503)
        .json(response.result({},0,"No offer list available!"));
      }
    }).catch((err)=> {
      return res
      .status(404)
      .json(response.result({},0,err));
    })
   }
});

/*API to delete particular offer based on bid and customer id of client*/

router.get('/deleteOffer',(req,res) => {
  var bid = req.query.bid;
  var customerCode = req.query.cc;

  if(!bid) {
    return res
      .status(404)
      .json(response.result({},0,'Missing bid'));
  }
  if(!customerCode) {
    return res
      .status(404)
      .json(response.result({},0,'Missing customer code'));
  }
  if(bid && customerCode) {
    let queryStr = "DELETE FROM main2$offer WHERE customercode="+`${customerCode}`+ "and bid="+`${bid}`+";";
    console.log(queryStr,"queryStr for deleting offer of user");
    let query = pgp.as.format(queryStr);

    db.any(query)
    .then(data => {
      console.log(data,"data on deleting offer");
    }).catch((err)=> {
      return res
      .status(404)
      .json(response.result({},0,err));
    })
  }
})

router.get('/lots', (req, res) => {
  var limit = parseInt(req.query.limit);
  var pageNum = parseInt(req.query.page_number);
  var companyName = req.query.company_name_en;
  var modelName = req.query.model_name_en;
  var modelYearFrom = req.query.model_year_en_from;
  var modelYearTo = req.query.model_year_en_to;
  var lotDate = req.query.lot_date;

  if (!limit) {
    limit = 20;
  }
  if (!pageNum) {
    pageNum = 0;
  }

  // var queryStr = "SELECT * FROM auctions$lot WHERE result_num = 5 ";
  var queryStr = "SELECT * FROM auctions$lot WHERE ";
  var queryDict = {
    limit: limit,
    pageNum: pageNum * limit
  }

  if (companyName) {
    queryStr = queryStr + " company_en = $/companyName/ ";
    queryDict['companyName'] = companyName;
  } else {
    return res
      .status(404)
      .json(response.result({}, 0, 'company name is required'));
  }

  if (modelName) {
    queryStr = queryStr + " AND model_name_en = $/modelName/ ";
    queryDict['modelName'] = modelName;
  } 

  if (modelYearFrom) {
    queryStr = queryStr + " AND model_year_en >= $/modelYearFrom/ ";
    queryDict['modelYearFrom'] = modelYearFrom;
  }

  if (modelYearTo) {
    queryStr = queryStr + " AND model_year_en <= $/modelYearTo/ ";
    queryDict['modelYearTo'] = modelYearTo;
  }

  if (lotDate) {
    var nextDate =
      queryStr = queryStr + " AND date >= $/lotDate/ AND date < (DATE $/lotDate/ + INTEGER '1') ";
    queryDict['lotDate'] = lotDate;
  }

  queryStr = queryStr + " ORDER BY model_year_en DESC LIMIT $/limit/ OFFSET $/pageNum/ ";
  var query = pgp.as.format(queryStr, queryDict);
  console.log(query);
  //date '2001-09-28' + integer '7'

  db.any(query)
    .then(function (data) {
      res.json(response.result(data, 1, "successfully retrieved lots"));
    })
    .catch(function (err) {
      return res
        .status(404)
        .json(response.result({}, 0, err));
    });
});

module.exports = router;