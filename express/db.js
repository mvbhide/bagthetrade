var mysql = require('mysql-wrapper');
var config = require('./config')
var Promise = require('promise');
var db = {};
var _ = require('lodash');

connect = function(){
	var conn = mysql({
		host: config.DB.host,
		user: config.DB.username,
		password: '',
		database: config.DB.database,
		multipleStatements: true
	})
	return conn;
}


var objResults = {
	success: true,
	data: {}
}

db.authenticateUser = function(e,p) {
	return new Promise(function(resolve, reject) {
		conn.connect(function(err){
			if(err) {
				objResults.success = false
				objResults.data = err
				reject(objResults)
			}
			var query = "SELECT * FROM `user` WHERE email='" + e +"' AND password='" + p + "'";
			conn.query(query,{}, function(err, results) {
				if(results && results.length == 1) {
					objResults.success = true;
					req.session.user = results;
					resolve(objResults);
				} else {
					objResults.success = false;
					reject(objResults)
				}
			})
		})
	})
}

db.setAccessToken = function(api_key, at) {
	console.log(api_key, at)
	conn.connect(function(err){
		if(err) {
			console.log(err);
			return;
		}
		var query = "UPDATE user SET access_token = '" + at + "' WHERE api_key='" + api_key + "'";
		console.log(query);
		conn.query(query, {}, function(err, results) {
			if(err == null) {
				var objResults = {
					"success": true
				}
			} else {
				var objResults = {
					"success": false,
					data : err
				}
			}
				
			return(objResults)
		})
	})
} 

db.setInstrumentData = function(objInstrument) {
		var query = "INSERT INTO instruments (tradingsymbol, instrument_token, tick_size, instrument_type, segment, lot_size, strike, expiry ) VALUES ('" + objInstrument.tradingsymbol + "', " + objInstrument.instrument_token + ", " + objInstrument.tick_size + ", '" + objInstrument.instrument_type + "', '" + objInstrument.segment + "', " + objInstrument.lot_size + ", " + objInstrument.strike + ", '" + objInstrument.expiry + "')";
		conn.query(query, objInstrument, function(err, results) {
			console.log(err, results);
			return(results);
		})
}

db.setInstruments = function(objInstruments) {
	return new Promise(function(resolve, reject) {
		var conn = connect();
		var query = "INSERT INTO instruments (tradingsymbol, instrument_token, tick_size, instrument_type, segment, lot_size, strike, expiry ) VALUES ";
		var success = true;
		_.map(objInstruments, function(ins) {
			var query = "INSERT INTO instruments (tradingsymbol, instrument_token, tick_size, instrument_type, segment, lot_size, strike, expiry ) VALUES ";
			if(ins && ins.tradingsymbol) {
				query += "('" + ins.tradingsymbol + "', " + ins.instrument_token + ", " + ins.tick_size + ", '" + ins.instrument_type + "', '" + ins.segment + "', " + ins.lot_size + ", " + ins.strike + ", '" + ins.expiry + "')";
				conn.query(query, {}, function(err, results) {
					if(err != null) {
						success = false;
					}
				})
			}
		});
		console.log("Done inserting margins in database")
		resolve(success);

	}) 
}

db.clearInstrumentsTable = function() {
	return new Promise(function(resolve, reject) {
		console.log("Clearing Instruments table")
		var conn = connect();
		console.log("connection", conn)
		var query = "DELETE FROM instruments";

		conn.query(query, {}, function(err, results) {
			console.log("Error: ", err)
			if(err == null) {
				resolve(results);
			} else {
				reject(results);	
			}
			
		})
	})
}

db.updateInstrumentsWithMargins = function(margins) {
	
	return new Promise(function(resolve, reject) {
var count = 0;
var conn = connect();
		_.map(margins, function(item) {
			var query = "";
			query += "UPDATE instruments SET co_lower=" + item.co_lower + ", co_upper=" + item.co_upper + " WHERE REPLACE(tradingsymbol, SUBSTR(tradingsymbol, -8), '')='" + item.tradingsymbol + "'";
			console.log(query);
			conn.query(query, {}, function(err, results) {
				if(err == null) {
					console.log(results)
				} else {
					console.log(err)
				}
			})
		});
		resolve(true);
	})	
}

db.lookupstocks = function(q) {
	return new Promise(function(resolve, reject) {

		var conn = connect();
			
		var	query = "SELECT * FROM instruments WHERE tradingsymbol like '" + q + "%' LIMIT 30";
		console.log(query);
		conn.query(query, {}, function(err, results) {
			if(err == null) {
				resolve(results)
			} else {
				reject(err)
			}
			
		});
	})
}

db.testMargins = function(objMargins) {
	return new Promise(function(resolve, reject) {
		var conn = connect();
		
		
var count = 0;
		_.map(objMargins, function(margin) {
			let txtValues = '';
			let columnList = "(" + Object.keys(margin).join(',') + ")";
			txtValues = "(" + _.map(_.values(margin), function(v){return "'" + v + "'" }).join(',') + ")";
			var query = "INSERT INTO instruments " + columnList + " VALUES " + txtValues;
			conn.query(query,{}, function(err, res){
				if(err != null) {
					reject(query);
				} 
			})
		})
		resolve(true)
		
	})		
}

module.exports = db;