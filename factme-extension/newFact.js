
var apiURL = "http://138.16.49.17/v1/"
var userID = "234567"
var highlight = "this is what I selected"
var pageURL = "test.com"

function submitDescription(replacement,description) {
  console.log(replacement, description)
}


document.getElementById("submitButton").onclick = function() {
  replacement = document.getElementById("replacementText").value;
  description = document.getElementById("descriptionText").value;
  payload = JSON.stringify({"highlight":highlight, "url":pageURL, "replacement":replacement, "description":description});
  // console.log(payload);
  api_post(endpoint=userID, payload=payload, function(data) {
    console.log(data);
  });
}
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {

//     if (request.status == "newFact") {
// 	   selection = request.text
//      alert(selection)
//    }
//     else if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });