const router = require("express").Router();
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

// When the server starts, create and save a new User document to the db
// The "unique" rule in the User model's schema will prevent duplicate users from being added to the server
db.User.create({ name: "The Coolest User Ever" })
  .catch(function(err) {
    console.log(err.message);
  });

// A GET route for scraping the echoJS website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios
    .get("http://www.nytimes.com/")
    .then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("article h2").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.update(
          { title: result.title },
          { $set: result },
          { upsert: true }
        ).catch(function(err) {
          // If an error occurred, send it to the client
          console.log(err);
        });
      });
    })
    .then(function(result) {
      console.log("RESULT:", result);
      res.render("scrape");
    })
    .catch(function(err) {
      console.log("ERR:", err);
      res.send(err);
    });
});

router.get("/", function(req, res) {
  const obj = {};
  obj.page = "/";

  db.Article.find()
    .then(function(articles) {
      obj.articles = articles;
      res.render("home", obj);
    })
    .catch(function(err) {
      res.send(err);
    });
});

router.get("/saved", function(req, res) {
  //method that pulls saved articles

  res.render("saved");
});
module.exports = router;
