var express = require('express');
var router = express.Router();
var request = require('superagent');
var responseResult = require('../helpers/response');
var baseUrl = 'http://75.125.226.218/xml/json?code=Nmdg45Kdhr7&sql=';


//APU to get all marksNAme(brand)
router.get('/companies', (req, res) => {
    request
        .get(baseUrl + 'select%20marka_name%20from%20main%20group%20by%20marka_name')
        .then(function (response) {
            // res.body, res.headers, res.status
            console.log(response.ok);
            if (response.ok) {
                var result = [];
                JSON.parse(response.text).forEach(element => {
                    var e = {
                        name: element['MARKA_NAME']
                    }
                    result.push(e);
                });
                res.json(responseResult.result(result, 1, "successfully retrieved companies"));
            } else {
                return res
                    .status(response.status)
                    .json(responseResult.result({}, 0, 'Unknown error'));
            }

        })
        .catch(function (err) {
            // err.message, err.response
            console.log(err);
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        });
});
//API to get all models
router.get('/models', (req, res) => {
    var makerName = req.query.company_name;
    var query = `select model_name from main where marka_name="${makerName}" group by model_name`;
    console.log(query);
    request
        .get(baseUrl + query)
        .then(function (response) {
            // res.body, res.headers, res.status
            console.log(response.ok);
            if (response.ok) {
                var result = [];
                JSON.parse(response.text).forEach(element => {
                    var e = {
                        name: element['MODEL_NAME']
                    }
                    result.push(e);
                });
                res.json(responseResult.result(result, 1, "successfully retrieved models"));

            } else {
                return res
                    .status(response.status)
                    .json(responseResult.result({}, 0, 'Unknown error'));
            }
        })
        .catch(function (err) {
            // err.message, err.response
            console.log(err);
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        });
});
//API to get all products
router.get('/products',(req,res)=> {
    var query = "SELECT * FROM main";
    console.log(query);
    request
        .get(baseUrl + query)
        .then(function (response) {
            // console.log(response,"response all product");
            if(response.ok){
                var result = [];
                JSON.parse(response.text).forEach(element => {
                    result.push(responseResult.convertedResult(element));
                });
                res.json(responseResult.result(result, 1, "successfully retrieved products"));
            }
            else {
                return res
                    .status(response.status)
                    .json(responseResult.result({}, 0, 'Unknown error'));
            }

        })
        .catch(function (err) {
            // err.message, err.response
            console.log(err);
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        });
});

router.get('/modelData',(req,res)=> {
    var index = parseInt(req.query.index);
    var upperLimit = parseInt(req.query.upperLimit);

    if(!index) {
        index = 0;
    }
    if(!upperLimit) {
        upperLimit = 250;
    }

    var queryStr = "SELECT MARKA_NAME, MARKA_ID, MODEL_ID, MODEL_NAME, COUNT(MODEL_ID) from main  group by MODEL_ID order by MARKA_NAME limit "+ `${index}`+","+`${upperLimit}`;

    console.log(baseUrl+queryStr);
    request
        .get(baseUrl + queryStr)
        .then(function (response) {
            if (response.ok) {
                var result = [];
                JSON.parse(response.text).forEach(element => {
                    result.push(element);
                });
                res.json(responseResult.result(result, 1, "successfully retrieved models"));

            } else {
                return res
                    .status(response.status)
                    .json(responseResult.result({}, 0, 'Unknown error'));
            }
        })
        .catch(function (err) {
            // err.message, err.response
            console.log(err);
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        });


});

router.get('/details',(req,res) => {
    var id = req.query.id;

    var queryStr = "SELECT * FROM main where id=" + `${id}`;

    console.log(queryStr)
    request
    .get(baseUrl + queryStr)
    .then(function (response) {
        console.log(response.ok)
        if(response.ok){
            var result = [];
            
                result.push(JSON.parse(response.text));
            
            res.json(responseResult.result(result,1,"suceesfull retrieved product"));
        } else {
            return res
                .status(404)
                .json(responseResult.result({},0, 'Unknown error'));
        }
    })
});

//http://75.125.226.218/xml/json?code=Nmdg45Kdhr7&sql=select+avg(FINISH)+from+stats+where+year+=+2005+and+status+=+%27sold%27+and+mileage+%3E+0+and+mileage+%3C+25000+and+rate+=+5

router.get('/average',(req,res) => {
    var KUZOV = req.query.KUZOV;
    var lowerMileage = req.query.lmile;
    var upperMileage = req.query.umile;
    var year = req.query.year;
    var rate = req.query.rate;
    var status = req.query.status;
    console.log(lowerMileage,"lmile");
    console.log(req.query,"query");

    //var queryStr = "select avg(FINISH) from stats where year ="+$year+and+status+=+%27sold%27+and+mileage+%3E+0+and+mileage+%3C+25000+and+rate+=+5";
   var queryStr = "SELECT * FROM stats where KUZOV = ' `${KUZOV}` '" + " and YEAR="+`${year}`+ " and MILEAGE > " + `${lowerMileage}` +" and MILEAGE < " + `${upperMileage}` + " and STATUS='" + `${status}` +"'" + " ORDER BY RATE";

    console.log(queryStr)
    request
        .get(baseUrl + queryStr)
        .then(function(response) {
            console.log(response.ok);
            if(response.ok){
                var result = [];

                result.push(JSON.parse(response.text));
                res.json(responseResult.result(result,1,"suceesfull reterived stats"));
            } else {
                return res
                .status(404)
                .json(responseResult.result({},0,"Unknown error"));
            }

        })
        .catch(function(err){
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        })
})


router.get('/stats',(req,res) => {
    var KUZOV = req.query.KUZOV;
    var lowerMileage = req.query.lmile;
    var upperMileage = req.query.umile;
    var year = req.query.year;
    var rate = req.query.rate;
    var status = req.query.status;
    console.log(lowerMileage,"lmile");
    console.log(req.query,"query");


    var queryStr = "SELECT * FROM stats where KUZOV = '" +`${KUZOV}` + "'" + " and YEAR="+`${year}`+ " and MILEAGE > " + `${lowerMileage}` +" and MILEAGE < " + `${upperMileage}` + " and STATUS='" + `${status}` +"'" + " ORDER BY RATE";

    console.log(queryStr)
    request
        .get(baseUrl + queryStr)
        .then(function(response) {
            console.log(response.ok);
            if(response.ok){
                var result = [];

                result.push(JSON.parse(response.text));
                res.json(responseResult.result(result,1,"suceesfull reterived stats"));
            } else {
                return res
                .status(404)
                .json(responseResult.result({},0,"Unknown error"));
            }

        })
        .catch(function(err){
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        })
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

    var queryStr = "SELECT * FROM main WHERE ";
    var query = "select * from main where ";

    if (companyName) {
        queryStr = queryStr + ` marka_name = "${companyName}" `;
    } else {
        return res
            .status(404)
            .json(response.result({}, 0, 'company name is required'));
    }

    if (modelName) {
        queryStr = queryStr + ` AND model_name = "${modelName}" `;
    }

    if (modelYearFrom) {
        queryStr = queryStr + ` AND year >= "${modelYearFrom}" `;
    }

    if (modelYearTo) {
        queryStr = queryStr + ` AND year <= "${modelYearTo}" `;
    }

    if (lotDate) { //BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY)  AND NOW()
        var nextDate =
            queryStr = queryStr + ` AND auction_date >= "${lotDate}" AND auction_date < DATE_SUB("${lotDate}", INTERVAL 1 DAY) `;
    }

    queryStr = queryStr + ` ORDER BY year DESC LIMIT ${limit * pageNum} , ${(pageNum + 1) * limit} `;

    console.log(queryStr);
    request
        .get(baseUrl + queryStr)
        .then(function (response) {
            console.log(response.ok);
            if (response.ok) {
                var result = [];
                JSON.parse(response.text).forEach(element => {
                    result.push(responseResult.convertedResult(element));
                });
                res.json(responseResult.result(result, 1, "successfully retrieved lots"));

            } else {
                return res
                    .status(response.status)
                    .json(responseResult.result({}, 0, 'Unknown error'));
            }
        })
        .catch(function (err) {
            // err.message, err.response
            console.log(err);
            return res
                .status(404)
                .json(responseResult.result({}, 0, err));
        });
});
module.exports = router;