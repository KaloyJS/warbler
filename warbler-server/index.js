//load env
require("dotenv").config();

const express        = require('express'),
	  app            = express(),
	  cors           = require('cors'),
	  bodyParser     = require('body-parser'),
	  PORT           = 3001,
	  errorHandler   = require("./handlers/error"),
	  authRoutes     = require('./routes/auth'),
	  messagesRoutes = require("./routes/messages"),
	  { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const db = require('./models');

app.use(cors());
app.use(bodyParser.json());

//all my routes here
app.use("/api/auth", authRoutes);
app.use(
	"/api/users/:id/messages",
	loginRequired,
	ensureCorrectUser,
	messagesRoutes
);

app.get("/api/messages", loginRequired, async function(req, res, next){
	try {
		let messages = await db.Message.find()
		 .sort({ createdAt: "desc" })
		 .populate("user", {
		 	username: true,
		 	profileImageUrl: true
		 });
		 return res.status(200).json(messages);
	} catch(err) {
		return next(err);
	}
})

//error handler
app.use(function(req, res, next) {
	let err = new Error("Not Found");
	err.status = 404;
	next(err);
});

//uses the error middleware
app.use(errorHandler);

app.listen(PORT, function() {
	console.log(`Server is starting at port ${PORT}`);
});