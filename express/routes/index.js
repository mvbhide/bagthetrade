var express = require('express');
var router = express.Router();
var ws = require('../ws')

/* GET home page. */
router.get('/', function(req, res, next) {
	ws.send({name: 'Milind'});
	res.render('index', { title: 'Express' });
});

router.post('/orderhook', function(req, res, next){
	res.send(req.body)
})

module.exports = router;
