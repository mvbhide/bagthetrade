var express = require('express');
var router = express.Router();
var ws = require('../ws')

/* GET home page. */
router.get('/', function(req, res, next) {
	ws.send({name: 'Milind'});
  res.render('index', { title: 'Express' });
});

module.exports = router;
