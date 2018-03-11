var db = require("../models");
var request = require('request');

module.exports = function(app) {
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
};