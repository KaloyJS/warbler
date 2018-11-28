const db = require("../models"),
	  jwt = require("jsonwebtoken");


exports.signin = async function(req, res, next) {
	try {
		//finding a user
		let user = await db.User.findOne({
			email: req.body.email
		});
		let { id, username, profileImageUrl } = user;
		let isMatch = await user.comparePassword(req.body.password);
		//checking if their password matches what was sent to the server
		if(isMatch) {
			let token = jwt.sign(
				{
					id,
					username,
					profileImageUrl
				},
				process.env.SECRET_KEY
		    );
		    return res.status(200).json({
		    	id,
		    	username,
		    	profileImageUrl,
		    	token
		    });
		} else {
			return next({
				status: 400,
				message: "Invalid email/Password."
			});
		}
	} catch(err) {
		return next({ status: 400, message: "Invalid Email/Password." });
	}
	//if it all matches
		//log them in
};

exports.signup = async function(req, res, next) {
	try {
		//create a user
		let user = await db.User.create(req.body);
		let { id, username, profileImageUrl } = user;

		//create a token (signing a token)
		let token = jwt.sign({
			id,
			username,
			profileImageUrl
		},
			//secret key
			process.env.SECRET_KEY
		);
		//responding with status 200 and a json with id, username, profileImageUrl and token
		return res.status(200).json({
			id,
			username,
			profileImageUrl,
			token
		});	
	} catch(err) {
		//if a validation fails!
		if(err.code === 11000) {
			//respond with a username/email already taken
			err.message = "Sorry, that username and/or email is taken";
		}		
		//otherwise just send back a generic 400
		return next({
			status: 400,
			message: err.message
		});
	}
};