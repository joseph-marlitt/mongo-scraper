var db = require("../models");
var request = require('request');
var axios = require ("axios");
var cheerio = require ("cheerio");

module.exports = function(app) {
app.get("/scrape", function(req, res) {
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
  
  app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err);
    });
  });
  
  app.get("/articles/:id", function(req, res) {
    console.log(req.params.id)
    db.Article.findOne({ _id: req.params.id })
    .populate('comments')
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err);
    });
  }); 
  app.post("/articles/:id", function(req, res) {
    console.log(req.body)
    db.Comment.create(req.body)
    .then(function(dbComment){
      console.log(dbComment._id)
      console.log(req.params.id)
      
    return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {comments: dbComment._id } }, { new: true });
    })
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err);
    });
  });
};