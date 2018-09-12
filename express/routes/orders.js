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
var redis = require('redis').createClient('redis://kitetest:RedisTest@redis-19229.c1.ap-southeast-1-1.ec2.cloud.redislabs.com:19229');
var _ = require('lodash');


router.get('/', function(req, res, next) {
	db.getAccessToken(config.API_KEY)
	.then(function(response) {
		var actk = response.data.access_token;
		console.log(actk);
		var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});

		kc.getOrders()
		.then(function(response) {
			//sPort.send('update-orders', response.data);
			res.json(response);
		})
		.catch(function(err) {
			res.json(err.response);
		})	
	})
	.catch(function(e) {
		console.log(e)
	})
})


router.post('/placeorder', function(req, res, next) {
	var kitecookie = req.session.kitecookie;
	var csrftoken = req.session.csrftoken;

	var variety = req.body.variety

	var options = {
		url: "https://kite.zerodha.com/api/orders/" + variety,
		form: req.body,
		headers: {
			"pragma": "no-cache",
			"method": "POST",
			"content-type": "application/x-www-form-urlencoded",
			"cookie": kitecookie,
			"accept-language": "en-US,en;q=0.9",
			"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
			"x-kite-version": "1.1.16",
			"accept": "application/json, text/plain, */*",
			"cache-control": "no-cache",
			"authority": "kite.zerodha.com",
			"referer": "https://kite.zerodha.com/dashboard",
			"x-csrftoken": csrftoken
		}
	}
	request.post(options, function(err, response, body) {
		res.json(response)
	})	
	
})

router.post('/modifyorder', function(req, res, next) {
	var kitecookie = req.session.kitecookie;
	var csrftoken = req.session.csrftoken;

	var orderid	= req.body.orderid;
	var variety = req.body.variety

	var options = {
		url: "https://kite.zerodha.com/api/orders/" + variety + "/" + orderid,
		form: req.body,
		headers: {
			"pragma": "no-cache",
			"method": "PUT",
			"content-type": "application/x-www-form-urlencoded",
			"cookie": kitecookie,
			"accept-language": "en-US,en;q=0.9",
			"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
			"x-kite-version": "1.1.16",
			"accept": "application/json, text/plain, */*",
			"cache-control": "no-cache",
			"authority": "kite.zerodha.com",
			"referer": "https://kite.zerodha.com/orders",
			"x-csrftoken": csrftoken
		}
	}
	request.put(options, function(err, response, body) {
		res.json(response)
	})	
})

router.post('/exit', function(req, res, next) {
	var kitecookie = req.session.kitecookie;
	var csrftoken = req.session.csrftoken;


	var order_id = req.body.order_id;
	var variety = req.body.variety
	var qryStr = querystring.stringify(req.body);

	var options = {
		url: "https://kite.zerodha.com/api/orders/" + variety + "/" + order_id + "?" + qryStr,
		method: 'DELETE',
		headers: {
			"pragma": "no-cache",
			"method": "PUT",
			"content-type": "application/x-www-form-urlencoded",
			"cookie": kitecookie,
			"accept-language": "en-US,en;q=0.9",
			"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
			"x-kite-version": "1.1.16",
			"accept": "application/json, text/plain, */*",
			"cache-control": "no-cache",
			"authority": "kite.zerodha.com",
			"referer": "https://kite.zerodha.com/orders",
			"x-csrftoken": csrftoken
		}
	}
	request.delete(options, function(err, response, body) {
		res.json(response)
	})	
});

module.exports = router;
