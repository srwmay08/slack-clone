;(function(){
	"use strict";
	
	var PORT = 3000;
	
	var fs = require('fs');
	
	var express = require('express');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var expressSession = require('express-session');
	
	var config = require('./config.js');
	
	var app = express();
	
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost');
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cookieParser());
	app.use(expressSession({
		secret: config.secret,
		resave: true,
    	saveUninitialized: true
	}));
	
	var Message = mongoose.model("Message", {
		text: String,
		username: String
	});
	
	app.get("/", function(req, res) {
		if (!req.session.username) {
			res.redirect("/login");
			return;
		}
		
		res.sendFile(__dirname + "/public/index.html");
	});
	
	app.get("/messages", function(req, res){
		if (!req.session.username) {
			res.send("[]");
			return;
		}
		Message.find({}, "text username", function (err, data) {
			if (err) {
				res.send("[]");
				return;
			}
			res.send(JSON.stringify(data));
		});
	});
	
	app.post("/messages", function(req, res){
		if (!req.session.username) {
			res.send("error");
			return;
		}
		
		if(!req.body.newMessage){
			res.send("error");
			return;
		}
		var message = new Message({
			text: req.body.newMessage,
			username: req.session.username
		});
		message.save(function (err) {
			if (err) {
				res.send(err);
				return;
			}
			res.send("success");
		});
	});
	
	
	
	app.get("/login", function(req, res){
		res.sendFile(__dirname + '/public/login.html');
	});
	
	function logInUser(user, pass, callback) {
		User.find({
			username: user,
			password: pass
		}, "username", callback)
	}
	
	app.post("/login", function (req, res) {
		if (req.body.username && req.body.password) {
			logInUser(
				req.body.username, 
				req.body.password, 
				function(err, data) {
					if (err) {
						res.redirect("/login");
						return;
					}
				req.session.username = data.username;
				res.redirect("/");
				return;
				}
			);
		}
	});
	
	var User = mongoose.model("User", {
		username: String,
		password: String
	});
	
	function createNewUser(user, pass) {
		var user = new User({
			username: user,
			password: pass
		});
		user.save(function (err) {
			if (err) {
				res.send(err);
				return;
			}
		});
		
	}
	//ADD NEW USER
	app.get('/create', function (req, res) {
		res.sendFile(__dirname + '/public/create.html');
	});

	app.post('/create', function (req, res) {
		if (req.body.username && req.body.password && req.body.pwconfirm) {
			if (req.body.password == req.body.pwconfirm) {
				createNewUser(req.body.username, req.body.password);
				res.redirect("/login");
				return;
			} else {
				res.send("Passwords don't match");
			}
		}
	});
	
	app.use(express.static('public'));
	
	app.use(function(req, res, next) {
		res.status(404);
		res.send("File not found");
	});
	
	app.listen(PORT, function() {
		console.log("server started on port " + PORT);
	});
	
}());









