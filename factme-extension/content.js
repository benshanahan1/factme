
// when the page loads, ask the background to retrieve the factlist from the server
var factList = undefined;
chrome.runtime.sendMessage({greeting: "hello", status: "pageLoaded", text: window.location.href}, function(response) {
	console.log(response);
	addFactsToPage(response.text);
});


function addFactsToPage(facts) {
  for (i in facts) {
    fact = facts[i];
    
    altText = "Suggested replacement: " + fact.replacement;
    inputText = document.body
    var innerHTML = inputText.innerHTML;
    var index = innerHTML.indexOf(text);
    if ( index >= 0 )
    { 
        innerHTML = innerHTML.substring(0,index) + 
            "<span class='factCheckedText' id='" + 
            fact.id + "' title='" + altText + "'>" + 
            innerHTML.substring(index,index+text.length) + 
            "</span>" + innerHTML.substring(index + text.length);
        inputText.innerHTML = innerHTML; 
    }

    idString = "id" + (fact.id).toString()
    factDisplayStringMod = factDisplayString.replace("replacementPopup", idString);    
    factDisplayStringMod = factDisplayStringMod.replace("areplacement:", fact.replacement);
    factDisplayStringMod = factDisplayStringMod.replace("adescription", fact.description);
    factDisplayStringMod = factDisplayStringMod.replace(">99<", ">" + (fact.votes).toString() + "<");


    // create div for fact display
    var factDisplayDiv = document.createElement('div');
    factDisplayDiv.innerHTML = factDisplayStringMod
    document.body.appendChild(factDisplayDiv);
      
    // populate with fact information
    // $("#" + idString).find("#replacement").text = fact.replacement;
    // $("#" + idString).find("#description").text = fact.description;
    // $("#" + idString).find("#voteCounter").text = fact.votes;
    // $("#" + idString).find("#upvoteBtn").click(function() { console.log("upvote")})
    // $("#" + idString).find("#downvoteBtn").click(function() {console.log("downvote")})
    }
}

var factDisplayString = `
<!-- Modal -->
<div class="modal fade" id="replacementPopup" tabindex="-1" role="dialog" aria-labelledby="replacementPopup" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header" style="background-color: whitesmoke">
        <span style="font-weight:bold;">Fact.Me</span>
        <span style="font-style:italic;"><u>Fact check</u> the internet.</span>
      </div>
      <div class="modal-body">
        <div class="container">
          <div class="row">
            <span style="font-style:italic; float:left;">areplacement</span>
          </div>
          <div class="row">
            <div class="col-lg-10">
              <blockquote class="blockquote">
                <p id="description">adescription</p>
              </blockquote>
            </div>
            
            <div class="col-lg-2">
              <button type="button" style="padding-left:20px; padding-right:20px;" class="btn btn-outline-primary" id="upvoteBtn">🢁</button>
              <div id="voteCounter" style="text-align:center;font-weight:bold;font-size:15pt;">99</div>
              <button type="button" style="padding-left:20px; padding-right:20px;" class="btn btn-outline-secondary" id="downvoteBtn">🢃</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

var factAddString = `
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
factPopupDiv.innerHTML = factAddString;
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
    $("#factPopup").modal('hide');
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


function highlight(text)
{
    var factid = 3;  // from callback
    var altText = "Replaced with: <some text here>";

    inputText = document.body
    var innerHTML = inputText.innerHTML;
    var index = innerHTML.indexOf(text);
    
    if ( index >= 0 )
    { 
        innerHTML = innerHTML.substring(0,index) + 
        "<span class='factCheckedText' id='" + 
            factid + "' title='" + altText + "'>" + 
            innerHTML.substring(index,index+text.length) + 
            "</span>" + innerHTML.substring(index + text.length);
        inputText.innerHTML = innerHTML; 
    }
}


// var myHilitor = new Hilitor();
// myHilitor.apply("generate");


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