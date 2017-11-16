var mysql = require('mysql');
var config = require('./config')
var Promise = require('promise');
var db = {};

var conn = mysql.createConnection({
	host: config.DB.host,
	user: config.DB.username,
	password: '',
	database: config.DB.database
})

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
			conn.query(query, function(err, results) {
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

db.setAccessToken = function(user_id, at) {
	conn.connect(function(err){
		if(err) {
			console.log(err);
			return;
		}
		var query = "UPDATE user SET access_token = '" + at + "' WHERE id=" + user_id;
		conn.query(query, function(err, results) {
			if(err == null) {
				var objResults = {
					"success": true
				}
			} else {
				var objResults = {
					"success": false
				}
			}
				
			return(objResults)
		})
	})
}

module.exports = db;