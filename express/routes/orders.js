var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var config = require('../config');
var KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
var objFactory = require('../object-factory/fp');
var request = require('request');
var querystring = require('querystring');
var Promise = require('promise');
//var redis = require('redis').createClient('redis://kitetest:RedisTest@redis-19229.c1.ap-southeast-1-1.ec2.cloud.redislabs.com:19229');
var _ = require('lodash');


router.get('/', function(req, res, next) {
	var actk = req.app.locals.access_token;
	
	var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});

	kc.getOrders()
	.then(function(response) {
		res.json(response);
	})
	.catch(function(err) {
		res.json(err.response);
	})	
	
})


router.post('/placeorder', function(req, res, next) {

	var actk = req.app.locals.access_token;
	var variety = req.body.variety
		
	var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});

	kc.placeOrder(variety, req.body)
	.then(response => {
		res.json(response);
	})
	.catch(err => {
		res.json(err);
	})
	

})

router.post('/modifyorder', function(req, res, next) {

	var actk = req.app.locals.access_token;
	var orderid	= req.body.orderid;
	var variety = req.body.variety
	
	var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});

	kc.modifyOrder(variety, orderid, req.body)
	.then(response => {
		res.json(response);
	})
	.catch(err => {
		res.json(err);
	})

})

router.post('/exit', function(req, res, next) {

	var order_id = req.body.order_id;
	var variety = req.body.variety
	var parent_order_id = req.body.parent_order_id
	var qryStr = querystring.stringify(req.body);
	
	var actk = req.app.locals.access_token;

	var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});

	kc.exitOrder(variety, order_id, {parent_order_id : parent_order_id})
	.then(result => {
		res.json(result);
	})
	.catch(err => {
		res.json()
	})
	
});

module.exports = router;
