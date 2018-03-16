var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close");

window.onclick = function(event) {
  if (event.target == modal) {
      modal.style.display = "none";
  }
}

$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    $(".displayWrap").append("<div class='articleItem eq'><p data-id='" + data[i]._id + "'>" + data[i].title + "<br/>" + data[i].link + "</p></div>");
  }
});
$(document).on("click", ".articleItem", function() {
  $(".modal-content").empty();
  $(".modal-content").append('<span class="close">&times;</span>')
  span.onclick = function() {
    modal.style.display = "none";
  }
  modal.style.display = "block";
  var thisId = $(this).children().attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(function(data) {
      console.log(data);
      console.log(data.comments)
      $(".modal-content").append("<h2>" + data.title + "</h2>");
      $(".modal-content").append("<input id='titleinput' name='title' placeholder='Comment Title'>");
      $(".modal-content").append("<textarea id='bodyinput' name='body' placeholder='You found me! (For Example)'></textarea>");
      $(".modal-content").append("<button data-id='" + data._id + "' id='savecomment'>Comment</button>");

      if (data.comments) {
        $(".modal-content").append("<div id='pastComments' <h2>" + data.comments.title + "</h2>");
        $("#pastComments").append("<h3>" + data.comments.body + "</h3>");
      }
    });
});

$(document).on("click", "#savecomment", function() {
  modal.style.display = "none";
  thisId = $(this).attr("data-id");
  console.log(thisId);
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function(data) {
      console.log(data);
      $(".commentsContainer").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
