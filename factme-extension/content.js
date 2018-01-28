
// when the page loads, ask the background to retrieve the factlist from the server
var factList = undefined;
chrome.runtime.sendMessage({greeting: "hello", status: "pageLoaded", text: window.location.href}, function(response) {
	console.log(response);
	factList = response.text;
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


function findTextInPage(phrase) {
	var elements = document.getElementsByTagName('*');

	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];

	    for (var j = 0; j < element.childNodes.length; j++) {
	        var node = element.childNodes[j];

	        if (node.nodeType === 3) {
	            var text = node.nodeValue;
	            var replacedText = text.replace(phrase, 'sendNudes');

	            if (replacedText !== text) {
	                element.replaceChild(document.createTextNode(replacedText), node);
	            }
	        }
	    }
	}
}

findTextInPage('sendMessage')