
// when the page loads, ask the background to retrieve the factlist from the server
var factList = undefined;
chrome.runtime.sendMessage({greeting: "hello", status: "pageLoaded", text: window.location.href}, function(response) {
	console.log(response);
	factList = response.text;
});

var userID = "234567"


factPopupString = `
<!-- Modal -->
<div class="modal fade" id="factPopup" tabindex="-1" role="dialog" aria-labelledby="factPopup" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header" style="background-color: whitesmoke">
        <span style="font-weight:bold;">Fact.Me</span>
        <span style="font-style:italic;"><u>Fact check</u> the internet.</span>
      </div>
      <div class="modal-body">
        <blockquote class="blockquote">
          <p id="highlighted-text"></p>
        </blockquote>
        <input class="form-control" type="text" placeholder="What it should actually say." id="replacementInput" />
        <div class="input-group">
          <textarea class="form-control" placeholder="Don't forget to cite your sources." rows="5" style="resize:none;" id="descriptionInput"></textarea>
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="submitBtn">Submit Fact</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

var factPopupDiv = document.createElement('div');
factPopupDiv.innerHTML = factPopupString;
document.body.appendChild(factPopupDiv);

$("#submitBtn").click(function() {

	 // Error check inputs
	 var replacement = $("#replacementInput").val()
	 var description = $("#descriptionInput").val()
	 if (replacement != "" && description != "") {
	 	
	 	payload = {"highlight":selection, "replacement":replacement, "description":description, "url": window.location.href};
	console.log(payload)
	chrome.runtime.sendMessage({greeting: "hello", status: "newFact", text: payload}, function(response) {
		console.log(response);
	});
	 }
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.status == "factCheckClicked") {
	   selection = window.getSelection().toString()
	   console.log(selection);
	   $("#highlighted-text").text(selection);
	   $("#factPopup").modal('show');
	   sendResponse({farewell: "goodbye", text: selection});
	 //   chrome.runtime.sendMessage({greeting: "hello", status: "factCheckClickResponse", text: selection}, function(response) {
		//   console.log(response.farewell);
		// });
    }
    else if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });


var myHilitor = new Hilitor();
myHilitor.apply("generate");


// function findTextInPage(phrase) {
// 	var elements = document.getElementsByTagName('*');

// 	for (var i = 0; i < elements.length; i++) {
// 	    var element = elements[i];

// 	    for (var j = 0; j < element.childNodes.length; j++) {
// 	        var node = element.childNodes[j];

// 	        if (node.nodeType === 3) {
// 	            var text = node.nodeValue;
// 	            var replacedText = text.replace(phrase, "<span class='factCheckedText'>" + phrase + "</span>");
//                 // document.body.innerHTML = document.body.innerHTML.replace(phrase, "<span class='factCheckedText'>" + phrase + "</span>");



// 	            if (replacedText !== text) {
// 	                element.replaceChild(document.createTextNode(replacedText), node);
// 	            }
// 	        }
// 	    }
// 	}
// }

// // findTextInPage('unpredictable')


// function highlight(container,what,spanClass) {
//     var content = container.innerHTML,
//         pattern = new RegExp('(>[^<.]*)(' + what + ')([^<.]*)','g'),
//         replaceWith = '$1<span ' + ( spanClass ? 'class="' + spanClass + '"' : '' ) + '">$2</span>$3',
//         highlighted = content.replace(pattern,replaceWith);
//     return (container.innerHTML = highlighted) !== content;
// }

// highlight(document.body, "examples", "factCheckedText");