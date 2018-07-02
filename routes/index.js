var express = require('express');
var router = express.Router();

var queries = require('./queries');
var external = require('./external');
router.use('/query', queries);
router.use('/api', external);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
