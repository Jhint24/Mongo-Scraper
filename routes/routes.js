const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');

// A GET route for scraping the echoJS website
router.get('/scrape', function(req, res) {
  // First, we grab the body of the html with request
  axios
    .get('http://www.nytimes.com/')
    .then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $('.story').each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .find('h2')
          .children('a')
          .text();
        result.link = $(this)
          .children('a')
          .attr('href');
        result.summary = $(this)
          .find('summary')
          .text();

        // Create a new Article using the `result` object built from scraping
        db.Article.update({ title: result.title }, { $set: result }, { upsert: true }).catch(
          function(err) {
            // If an error occurred, send it to the client
            console.log(err);
          }
        );
      });
    })
    .then(function(result) {
      console.log('RESULT:', result);
      res.render('scrape');
    })
    .catch(function(err) {
      console.log('ERR:', err);
      res.send(err);
    });
});

router.get('/', function(req, res) {
  const obj = {};
  obj.page = '/';

  db.Article.find()
    .then(function(articles) {
      obj.articles = articles;
      res.render('home', obj);
    })
    .catch(function(err) {
      res.send(err);
    });
});

router.post('/savedArticles', function(req, res) {
  console.log('Link', req.body.link);
  console.log('Title', req.body.title);
  db.User.findOneAndUpdate(
    { name: 'The Coolest User Ever' },
    { $push: { articles: req.body.id } },
    // { $push: { articles: req.body.title }},
    // { $push: { articles: req.body.link }},
    { new: true }
  )

    .then(function() {
      res.send('Article Saved :)');
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.send('Article was not saved, please try again');
    });
});
router.get('/saved', function(req, res) {
  //method that pulls saved articles
  const obj = {};

  db.User.find()
    .populate('articles')
    .then(function(result) {
      obj.articles = result[0].articles;
      res.render('saved', obj);
      console.log(result[0].articles);
    })
    .catch(function(err) {
      console.log(err);
      res.send(err);
    });
});

router.delete('/removeSaved', function(req, res) {
  db.User.update({ name: 'The Coolest User Ever' }, { $pull: { articles: id } }) //pullarticle to delete, documentation mongo $pull
    .then(result => console.log('RES:', result))
    .catch(err => console.log('ERR::', err));
});
{
}
module.exports = router;
