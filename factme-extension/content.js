
// when the page loads, ask the background to retrieve the factlist from the server
var factList = undefined;
chrome.runtime.sendMessage({greeting: "hello", status: "pageLoaded", text: window.location.href}, function(response) {
	console.log(response);
	addFactsToPage(response.text);
});


function addFactsToPage(facts) {
  for (i in facts) {
    fact = facts[i];

  idString = "id" + (fact.id).toString()

 
    altText = "Suggested replacement: " + fact.replacement;
    inputText = document.body
    var innerHTML = inputText.innerHTML;
    var index = innerHTML.indexOf(fact.highlight);
    if ( index >= 0 )
    { 
        innerHTML = innerHTML.substring(0,index) + 
            "<span class='factCheckedText' id='" + 
            idString + "text' title='" + altText + "'>" + 
            innerHTML.substring(index,index+altText.length) + 
            "</span>" + innerHTML.substring(index + altText.length);
        inputText.innerHTML = innerHTML; 
    }

    
    var factDisplayStringMod = factDisplayString.replace("replacementPopup", idString);    
    factDisplayStringMod = factDisplayStringMod.replace("areplacement", fact.replacement);
    factDisplayStringMod = factDisplayStringMod.replace("adescription", fact.description);
    factDisplayStringMod = factDisplayStringMod.replace("voteCounter", idString + "voteCounter");
    factDisplayStringMod = factDisplayStringMod.replace("upvoteBtn", idString + "upvoteBtn");
    factDisplayStringMod = factDisplayStringMod.replace("downvoteBtn", idString + "downvoteBtn");

   
    // create div for fact display
    var factDisplayDiv = document.createElement('div');
    factDisplayDiv.innerHTML = factDisplayStringMod
    document.body.appendChild(factDisplayDiv);
      
    document.getElementById(idString + "voteCounter").innerHTML = (fact.votes).toString()

    $("#" + idString + "text").click( function() {
      console.log(idString + "text")
      $("#" + idString).modal('show');
    });

    $("#" + idString + "upvoteBtn").click( function() {
      console.log(idString + "upvoteBtn")

      vote("upvote", fact.id, idString)
    });

    $("#" +  idString + "downvoteBtn").click( function() {
      console.log(idString + "downvoteBtn")

      vote("downvote", fact.id, idString)
    });


    }
}

function vote(action, id, idString) {
  chrome.runtime.sendMessage({greeting: "hello", status: "vote", text: {action:action, id:id}}, function(response) {
    console.log("vote: ", response);
    if (response.text) {
    chrome.runtime.sendMessage({greeting: "hello", status: "getVote", text:id}, function(response) {
      console.log("get vote: ", response);
      document.getElementById(idString + "voteCounter").innerHTML = response.text;
    });
  }
  });
}

function getVote(id, idString) {
  chrome.runtime.sendMessage({greeting: "hello", status: "getVote", text:id}, function(response) {
  console.log("get vote: ", response);
  document.getElementById(idString + "voteCounter").innerHTML = response.text
});
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
              <blockquote class="blockquote">
                <p id="description">adescription</p>
              </blockquote>
            </div>
            <div style="float:right;">
              <button type="button" style="padding-left:20px; padding-right:20px;" class="btn btn-outline-primary" data-toggle="tooltip" id="downvoteBtn">\\/</button> 
              <button id="voteCounter" style="text-align:center;font-weight:bold;font-size:15pt;" class="btn btn-outline-dark" disabled>0</button>   
              <button type="button" style="padding-left:20px; padding-right:20px;" class="btn btn-outline-primary" data-toggle="tooltip" id="upvoteBtn">/\\</button>

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