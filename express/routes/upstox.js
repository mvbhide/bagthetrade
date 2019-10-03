var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var config = require('../config');
var fs = require("fs");

var Upstox = require("upstox");
var mailer = require("nodemailer");
var request = require('request');
var Promise = require('promise');
//var redis = require('redis').createClient('redis://kitetest:RedisTest@redis-19229.c1.ap-southeast-1-1.ec2.cloud.redislabs.com:19229');
var _ = require('lodash');

var upstox = new Upstox(config.API_KEY);

var schedule = require('node-schedule');

var j = schedule.scheduleJob('2 */15 * * * *', function(){
	let hour = new Date().getHours();
	if(hour > 8 && hour <16) {
		getdata();
	}

});

router.get("/", function(req, res, next) {
	var loginUrl = upstox.getLoginUri(config.loginUri);
	res.redirect(loginUrl);
})

router.get("/auth", function(req, res, next) {
	if(req.params) {
		let code = req.query.code;

		var params = {
			"apiSecret" : config.API_SECRET,
			"code" : code,
			"grant_type" : code,
			"redirect_uri" : config.loginUri
		};
		
		var accessToken;
		
		upstox.getAccessToken(params)
			.then(function(response) {
			  accessToken = response.access_token;
			  upstox.setToken(accessToken);
			  fs.writeFile('../token.txt', accessToken);
			  res.end("OK")
			})
			.catch(function(err) {
				res.end(JSON.stringify(err)); // handle error 
			});
		
	} else {
		res.end("Some error occured");
	}
})
	

router.get("/getdata", function(req, res, next) {
	var data = getdata(res);
})

router.get("/test", function(req, res, next) {
	var d = getPreviousDay();
	res.end(getFormattedDate(d));
})

router.get("/getdata/:id", function(req, res, next) {
	var symbol = req.params.id;
	fs.readFile("../token.txt", function(err, data) {
		upstox.setToken(data);
		callApi(symbol)
		.then(function(response) {
			response.data.reverse();
			var result = scanner(response)
			res.end(JSON.stringify(response))
		})
		.catch(function(err) {
			res.end("Error : " + JSON.stringify(err));
		})
	})
})

var callApi = function(symbol) {
	return upstox.getOHLC({
		"exchange": "NSE_EQ",
		"symbol": symbol,
		"format": "json",
		"interval": "15MINUTE",
		"start_date": previousDay,
		"end_date": today
	})
	.then(function (response) {
		console.log(symbol + " API successful")
		response.symbol = symbol
		return response;
	})
	.catch(function (error) {
		//response.end("Error : " + JSON.stringify(err));
		//throw error;
	});
}

var getFormattedDate = (d) => {
	var dd = d.getDate(); 
	var mm = d.getMonth() + 1; 
	var yyyy = d.getFullYear(); 
	dd = dd < 10 ? '0' + dd : dd 
	mm =  (mm < 10) ?'0' + mm : mm; 
	return dd + '-' + mm + '-' + yyyy; 
}

var getPreviousDay = function() {
	var d = new Date(2019,9,4);
	console.log(d)
	var arrHoliays = [
		"02-10-2019",
		"08-10-2019",
		"28-10-2019",
		"12-11-2019",
		"25-12-2019"
	]
	do {
		d.setDate(d.getDate() - 1);
	} while((d.getDay() == 0 || d.getDay() == 6) && !arrHoliays.includes(getFormattedDate(d)))
	return d;
}

var today = "03-10-2019"; //getFormattedDate(new Date());
var previousDay = "01-10-2019";//getFormattedDate(getPreviousDay());
console.log(today, previousDay)
var getdata = function(out = "") {
	fs.readFile("../token.txt", function(err, data) {
		upstox.setToken(data);		
		var count = 0;
		var resolvedCount = 0;
		arrCalls = []
		arrObjResponse = [];
		var loop = setInterval(function() {
			for(i = 0; i < 10; count++, i++) {
				callApi(stocks[count])
				.then(function(priceData) {
					resolvedCount++;
					if(priceData && priceData.data) {
						priceData.data.reverse();
						let obj = {};
						obj.symbol = priceData.symbol;
						obj.result = scanner(priceData);
						arrObjResponse.push(obj);
					}
				})
			}
			if(count >= (stocks.length - 1)) {
				clearInterval(loop);
			}
		}, 1000)
		var rcLoop = setInterval(function() {
			if(resolvedCount >= (stocks.length -1)) {
				clearInterval(rcLoop)
				let dataToSend = [];
				arrObjResponse.forEach(element => {
					if(element && element.result && element.result.pattern !== "") {
						dataToSend.push(element);
					}
				});
				var html = generateHTML(dataToSend);
				if(out !== "") {
					out.end(html);
				} else {
					sendmail(html);
				}
				return dataToSend;
			}
		},1000)
	})		
}

var scanner = function(objData) {
	var data = objData.data
	var objCandle = {};
	var c = []
	
	for(var i = 0; i < 4; i++) {
		if(typeof data[i] == 'undefined') break;
		objCandle.date = data[i].timestamp;
		objCandle.open = Number(data[i].open);
		objCandle.high = Number(data[i].high);
		objCandle.low = Number(data[i].low);
		objCandle.close = Number(data[i].close);
		objCandle.volume = Number(data[i].volume);
		objCandle.candleSize = Number((objCandle.high - objCandle.low).toFixed(2));
		objCandle.body = Number(Math.abs(objCandle.open - objCandle.close).toFixed(2));
		objCandle.bodyCenter = Number(((objCandle.open + objCandle.close)/2).toFixed(2));
		if(objCandle.open > objCandle.close) {
			objCandle.color = "Red"
		}
		if(objCandle.close > objCandle.open) {
			objCandle.color = "Green"
		}
		//eval('c' + (i + 1) + ' = objCandle' );
		if(i==0) {
			todaysCandle = objCandle;
		}
		c[i] = objCandle;
		objCandle = {};
	}

	var avg_vol = 0;

	var result = {};
	result.trend = "";
	result.pattern = "";
	/* result.candle = {
		...c[0],
		downtrendReversalCondition: "" + (c[0].high-c[0].bodyCenter) + "," + (c[0].bodyCenter - c[0].low)/5,
		downtrendReversalResult: (c[0].high-c[0].bodyCenter) < (c[0].bodyCenter - c[0].low)/5,
		uptrendReversalCondition: "" + (c[0].bodyCenter - c[0].low) + "," + (c[0].high - c[0].bodyCenter)/5,
		uptrendReversalResult: (c[0].bodyCenter - c[0].low) < (c[0].high - c[0].bodyCenter)/5
	}; */

/*	if( ( c2.high < c3.high < c4.high) && ( c2.low > c3.low > c4.low) ) {
		result.trend = "down";
	}

	if( ( c2.high > c3.high > c4.high) && ( c2.low < c3.low < c4.low) ) {
		result.trend = "up";
	}*/

	if( (c[1].candleSize < c[0].candleSize) && (c[0].body < (0.2 * c[0].candleSize)) ) {
		if( (c[0].high-c[0].bodyCenter) < (c[0].bodyCenter - c[0].low)/5 ) {
			result.pattern = "&#8593;";
			result.price = c[0].close;
			result.threshold = c[0].low + "(" + (c[0].close - c[0].low).toFixed(2) + ")";
		}
		if( (c[0].bodyCenter - c[0].low) < (c[0].high - c[0].bodyCenter)/5 )  {
			result.pattern = "&#8595;";	
			result.price = c[0].close;
			result.threshold = c[0].high + "(" + (c[0].high - c[0].close).toFixed(2) + ")";
		}
		if( c[0].volume > (c[1].volume + c[2].volume + c[3].volume)) {
			result.pattern += "Volume surge"
		}
	}

	/* if( (c[0].open > c[1].high) && (c[0].close < c[1].bodyCenter) ) {
		result.pattern = "Dark cloud cover";
	}

	if( c[0].color == "Red"  && (c[0].open > c[1].high) && (c[0].close < c[1].low) ) {
		result.pattern = "Bearish Engulfing candle"
	}

	if( c[0].color == "Green"  && (c[0].open < c[1].low) && (c[0].close > c[1].high) ) {
		result.pattern = "Bullish Engulfing candle"
	} */

	return result;
}


var sendmail = function(body) {
	var nodemailer = require('nodemailer');
	var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'bagthetrade@gmail.com',
		pass: 'Trade!@#123'
	}
	});

	var mailOptions = {
	from: 'bagthetrade@gmail.com',
	to: 'milind.subscriptions@gmail.com',
	subject: 'Candlestick patterns',
	html: body
	};

	transporter.sendMail(mailOptions, function(error, info){
	if (error) {
		console.log(JSON.stringify(error));
	} else {
		console.log('Email sent: ' + JSON.stringify(info.response));
	}
	});
}

var generateHTML = function(data) {

	var getclass = function(p) {
		return p == "&#8593;" ? "green" : "red";
	}

	var tableHtml = "";
	for(i=0; i< data.length; i++) {
		tableHtml += "<tr><td>" + data[i].symbol + "</td><td class='" + getclass(data[i].result.pattern) + "'>" + data[i].result.pattern + "</td><td>" + data[i].result.price + "</td><td>" + data[i].result.threshold + "</tr>";
	}

	var html = `
		<html>
		<head>
		<style>
			body  {font-family: 'Calibri';}
			table {border-collapse: collapse;}
			table tr td {padding: 5px;}
			.green { color : green; font-weight: bold}
			.red { color: red; font-weight: bold}
		</style>
		</head>
		<body>
			<table border="1"><thead><th>Symbol</th><th>Pattern</th><th>Price</th><th>Threshold</th></thead> ` + tableHtml +`</table>
		</body>
		</html>
	`
	return html;
}

var stocks = [
	"ACC", 
	"ADANIENT",
	"ADANIPOWER",
	"AMARAJABAT",
	"AMBUJACEM",
	"APOLLOHOSP",
	"APOLLOTYRE",
	"ARVIND",
	"ASHOKLEY",
	"ASIANPAINT",
	"AUROPHARMA",
	"AXISBANK",
	"BAJAJ-AUTO",
	"BANKBARODA",
	"BANKINDIA",
	"BATAINDIA",
	"BEL",
	"BHARATFORG",
	"BHARTIARTL",
	"BHEL",
	"BIOCON",
	"BPCL",
	"CIPLA",
	"COALINDIA",
	"DABUR",
	"DHFL",
	"DISHTV",
	"DIVISLAB",
	"DLF",
	"DRREDDY",
	"EXIDEIND",
	"FEDERALBNK",
	"GAIL",
	"GLENMARK",
	"GMRINFRA",
	"GRASIM",
	"HCLTECH",
	"HDFC",
	"HDFCBANK",
	"HDIL",
	"HEROMOTOCO",
	"HEXAWARE",
	"HINDALCO",
	"HINDPETRO",
	"HINDUNILVR",
	"HINDZINC",
	"ICICIBANK",
	"IDBI",
	"IDFC",
	"IGL",
	"INDIACEM",
	"INFRATEL",
	"INFY",
	"IOC",
	"ITC",
	"JSWSTEEL",
	"KOTAKBANK",
	"KTKBANK",
	"LICHSGFIN",
	"LT",
	"LUPIN",
	"MARUTI",
	"MRF",
	"NCC",
	"NHPC",
	"NMDC",
	"NTPC",
	"OFSS",
	"OIL",
	"ONGC",
	"PCJEWELLER",
	"PETRONET",
	"PFC",
	"PNB",
	"POWERGRID",
	"RECLTD",
	"RELIANCE",
	"SAIL",
	"SBIN",
	"SIEMENS",
	"SOUTHBANK",
	"SUNTV",
	"TATACHEM",
	"TATAGLOBAL",
	"TATAMOTORS",
	"TATAPOWER",
	"TATASTEEL",
	"TCS",
	"UBL",
]


module.exports = router;
