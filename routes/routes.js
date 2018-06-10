var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./../models");
module.exports = function (app) {
	//Headline - the title of the article

	//  * Summary - a short summary of the article

	//  * URL - the url to the original article

	//  * Feel free to add more content to your database (photos, bylines, and so on).

	console.log("success");
	app.get("/scrape", function (req, res) {
		// First, we grab the body of the html with request
		axios.get("https://www.nytimes.com//").then(function (response) {
			// Then, we load that into cheerio and save it to $ for a shorthand selector
			var $ = cheerio.load(response.data);

			// Iterate over each article
			$("article").each(function (i, element) {
				// Save an empty result object
				var result = {};
				var articleInfo = $(this).children("h2").children("a");
				// console.log($(this).children("a").text() + "element");
				result.title = articleInfo.text();
				result.link = articleInfo.attr("href");
				result.summary = $(this).children(".summary").text();
				console.log(result.title + result.link + result.summary);

				db.Article.findOneAndUpdate(result, result, {
					upsert: true,
					setDefaultsOnInsert: true
				}, function (error, result, response) {
					// View the added result in the console
					if (error)
						console.log(error);

					console.log(result);
				});


			});

		});

		res.send("Scrape Complete");
	});

	app.get("/articles", function (req, res) {
		// Grab every document in the Articles collection
		db.Article.find({})
			.then(function (dbArticle) {
				// If we were able to successfully find Articles, send them back to the client
				var hbsObject = {
					article: dbArticle
				}
				console.log(JSON.stringify(hbsObject));
				res.render("index", hbsObject);
			})
			.catch(function (err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});
	app.get("/articles/:id", function (req, res) {

		db.Article.findOne({
				_id: req.params.id
			})

			.populate("Comment")
			.then(function (dbArticle) {
				res.json(dbArticle);
			})
			.catch(function (err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});

	// Route for saving/updating an Article's associated Note
	app.post("/articles/:id", function (req, res) {
		// Create a new note and pass the req.body to the entry
		db.Comment.create(req.body)
			.then(function (dbComment) {
				// If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
				// { new: true } tells the query that we want it to return the updated User -- it returns the original by default
				// Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
				return db.Article.findOneAndUpdate({
					_id: req.params.id
				}, {
					comment: dbComment._id
				}, {
					new: true
				});
			})
			.then(function (dbArticle) {
				// If we were able to successfully update an Article, send it back to the client
				res.json(dbArticle);
			})
			.catch(function (err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});

	app.delete("articles/:id", function (req, res) {
		db.Comment.findOneAndRemove({
			__id: req.params.id
		}, function (error, doc) {
			if (error)
				console.log(error);
			db.Article.findOneAndRemove(doc),
				function (error, doc) {
					if (error)
						console.log(error)
				}
		});
	})


}