import * from 'api.js'

var apiURL = "http://138.16.49.17/v1/"
var userID = "234567"

// request facts associated with the current page
payload = JSON.stringify({url:window.location.href})
api_post(endpoint=userID, payload=payload, function(data) {
console.log(data);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.status == "factCheckClicked") {
	   selection = window.getSelection().toString()
	   sendResponse({farewell: "goodbye", text: selection});
	 //   chrome.runtime.sendMessage({greeting: "hello", status: "factCheckClickResponse", text: selection}, function(response) {
		//   console.log(response.farewell);
		// });
    }
    else if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });