var express = require('express');
var router = express.Router();
var ws = require('../ws')
var objFactory = require('../object-factory/fp');

/* GET home page. */
router.get('/', function(req, res, next) {
	ws.send({name: 'Milind'});
	res.render('index', { title: 'Express' });
});

router.post('/orderhook', function(req, res, next){
	var objOrder;
	if(req.body && req.body.status == 'COMPLETE') {
		objOrder = _.extend(objFactory.get('orderhook'), req.body);

		/*
		* Lot of decisions go here. Potential further steps are
			1. Communicate the status to client
			2. Decide in case of error
		*/ 
	}

})

module.exports = router;
