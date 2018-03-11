var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://austin.craigslist.org/search/mis").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".result-row").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children()
        .children("a")
        .text();
      result.link = $(this)
        .children()
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
  // TODO: Finish the route so it grabs all of the articles
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findById(req.params.id)
  .populate('note')
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Comment.create(req.body)
  .then(function(dbComment){
    return db.Article.findOneAndUpdate({_id: req.params.id}, { $set: { note: dbComment._id } }, { new: true });

  })

  db.Article.findById(req.params._id)
  .populate('comment')
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});