var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');
// var expressLayouts = require('express-ejs-layouts');


//CONFIGURING EXPRESS

app.use(bodyParser.urlencoded({extended : true}));
// app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));


app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");


//CREATING CONNECTION WITH MYSQL DATABASE

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	database : 'profiles'
}); 

//DEFINING API ROUTES

app.get("/", function(req, res) {
	var q = `SELECT * FROM users`;
	connection.query(q, function(error, results) {
		if(error) throw error;
		res.render('home', {results : results, title : 'Home'});
	});
});


app.get("/create_user", function(req, res) {
	res.render('create_user', {title : 'CREATE USER'});
});


app.post("/register_user", function(req, res) {
	var q1 = `SELECT COUNT(*) AS count FROM users WHERE email LIKE ?`;
	connection.query(q1, [req.body.email], function(error, results) {
		if(error) throw error;
		if(results[0].count > 0) {
			// res.send("<h3>There already exists an account with the provided email id</h3>");
			res.render('error', {title : 'ERROR 400'});
		} else {
			var person = {
				first_name : req.body.first_name,
				last_name : req.body.last_name,
				email : req.body.email,
				phone_number : req.body.phone_number
			};
			var q2 = `INSERT INTO users SET ?`;
			connection.query(q2, person, function(error, results) {
				if(error) throw error;
				res.redirect('/');
			});
		}
	});
});


app.get("/delete_user/:id", function(req, res) {
	var id = req.params.id;
	var q = `DELETE FROM users WHERE id = ${id}`;
	connection.query(q, function(error, request) {
		if(error) throw error;
		res.redirect('/');
	});
});


app.get("/update_user_form/:id", function(req, res) {
	var id = req.params.id;
	var q = `SELECT * FROM users WHERE id = ${id}`;
	connection.query(q, function(error, results) {
		if(error) throw error;
		res.render('update_user', {results : results, title : "UPDATE USER"});
	});
});


app.post("/update_user/:id", function(req, res) {
	
	var id = req.params.id;
	var email = req.body.email;
	var q1 = `SELECT COUNT(*) AS count FROM users WHERE email LIKE "${email}" AND id != ${id}`;
	
	connection.query(q1, function(error, results) {
		if(error) throw error;
		if(results[0].count > 0) {
			// res.send("<h3>There already exists an account with the provided email id</h3>");
			res.render('error', {title : 'ERROR 400'});
		} else {
			var first_name = req.body.first_name;
			var last_name = req.body.last_name;
			var email = req.body.email;
			var phone_number = req.body.phone_number;
			
			var q2 = `UPDATE users SET first_name="${first_name}", last_name="${last_name}", email="${email}",phone_number=${phone_number} WHERE id=${id}`;
			
			connection.query(q2, function(error, results) {
				if(error) throw error;
				res.redirect('/');
			});
		}
	});
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
	console.log("Server running on port 3000");
});