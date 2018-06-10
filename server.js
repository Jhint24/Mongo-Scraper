const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const db = require("./models");

const PORT = 8080;

// Initialize Express
const app = express();

// When the server starts, create and save a new User document to the db
// The "unique" rule in the User model's schema will prevent duplicate users from being added to the server
db.User.create({ name: "The Coolest User Ever" }).catch(function(err) {
  console.log(err.message);
});

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

//sets handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    partialsDir: __dirname + "/views/partials"
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongoNewsScraperDB");
//If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoNewsScraperDB";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// mongoose.connect("mongodb://localhost/mongoNewsScraperDB");

//added routes pathing
app.set("views", path.join(__dirname, "views"));

// Import routes and give the server access to them.
const routes = require("./routes/routes.js");

app.use(routes);

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
module.exports = app;
