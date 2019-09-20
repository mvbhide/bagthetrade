var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var config = require('../config');

var Upstox = require("upstox");

var request = require('request');
var Promise = require('promise');
//var redis = require('redis').createClient('redis://kitetest:RedisTest@redis-19229.c1.ap-southeast-1-1.ec2.cloud.redislabs.com:19229');
var _ = require('lodash');

var upstox = new Upstox("hfQWSWyAyK5mU5pBAYA6GaWgnOpRhJ307CtRo1RP");

router.get("/", function(req, res, next) {
	var loginUrl = upstox.getLoginUri("http://localhost:8080/upstox/auth/");
	res.redirect(loginUrl);
})

router.get("/auth", function(req, res, next) {
	if(req.params) {

		let code = req.query.code;
console.log(code);
		var params = {
			"apiSecret" : "2duv6utg3e",
			"code" : code,
			"grant_type" : code,
			"redirect_uri" : "http://localhost:8080/upstox/auth/"
		};
		
		var accessToken;
		
		upstox.getAccessToken(params)
			.then(function(response) {
			  accessToken = response.access_token;
			  upstox.setToken(accessToken);
			  upstox.getOHLC({
					"exchange": "NSE_EQ",
					"symbol": "SBIN",
					"format": "json",
					"interval": "15MINUTE",
					"start_date": "19-09-2019",
					"end_date": "19-09-2019"
				})
					.then(function (response) {
						
						res.end(JSON.stringify(response));
					})
					.catch(function (error) {
						res.end("Error", error);
					});
			})
			.catch(function(err) {
				res.end(JSON.stringify(err)); // handle error 
			});
		
	} else {
		res.end("Some error occured");
	}
	

	router.get("/getdata", function(req, res, next) {
		upstox.getOHLC({
			"exchange": "NSE_EQ",
			"symbol": "SBIN",
			"format": "json",
			"interval": "15MINUTE",
			"start_date": "19-09-2019",
			"end_date": "19-09-2019"
		})
			.then(function (response) {
				console.log(JSON.stringify(response));
				res.end(JSON.stringify(response));
			})
			.catch(function (error) {
				res.end("Error", error);
			});
	})

})

module.exports = router;
