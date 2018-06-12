//user presses a button

//id to collection user post  /

//jQuery the button click id sen _id to collection

//button saves the article into user array id of article
//how to get user id

//
$(".saved-btn").on("click", function() {
  var savedArticleID = $(this).attr("data-id");
  //   console.log($(this));
  //   console.log(savedArticleID);
  $.post("/savedArticles", { id: savedArticleID }, function(data) {});
  $(this).remove();
  $("#button-gone").replaceWith("Article Saved");

});

