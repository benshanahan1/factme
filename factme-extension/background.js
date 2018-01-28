var apiURL = "http://138.16.49.17/v1/";
var userID = "234567";


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
    // return the factlist when the page loads
    if (request.status == "pageLoaded") {
      console.log('Getting facts for', request.text);
      payload = JSON.stringify({url:request.text});
      endpoint = userID + "/get_facts_by_url/";
      var factList = undefined;
      api_post(endpoint=endpoint, payload=payload, function(data) { 
        console.log('idlist', data);
        sendResponse({farewell: "goodbye", text: data});
      });
      return true;

      // while (factList == undefined) console.log('waiting for data');
      
    }
    else if (request.status == "factCheckClickResponse") {
      console.log(request.text)
      chrome.windows.create({"url": 'redirect.html', "type": 'popup'});
    }


    else if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });

function fetch_text (url) {
    return fetch(url).then((response) => (response.text()));
}



// A generic onclick callback function.
function factCheckOnClick(info, tab) {
  chrome.tabs.sendMessage(tab.id, {greeting: "hello", status: "factCheckClicked"}, function(response) {
    console.log(response.text);
    chrome.windows.create({'url': 'newFact.html', 'type': 'popup'}, function(window) {
      chrome.tabs.sendMessage(window.id, {greeting: "hello", status: "newFact", text:response.txt})});
    // var div = document.createElement('div');
    // div.innerHTML = fetch_text("newFact.html");
    // div.setAttribute("style", "position: absolute, width: 500px, height:500px, top: 20px, right: 20px, z-index: 99");
    // document.body.appendChild(div);

  });
}


var id = chrome.contextMenus.create({"title": "Fact Check", "contexts": ["selection"], "onclick": factCheckOnClick});


// Create some checkbox items.
function replaceTextOnClick(info, tab) {
  console.log(JSON.stringify(info));
  console.log("checkbox item " + info.menuItemId +
              " was clicked, state is now: " + info.checked +
              "(previous state was " + info.wasChecked + ")");

}
var checkbox1 = chrome.contextMenus.create(
  {"title": "Replace Text", "type": "checkbox", "contexts": ["all"], "onclick":replaceTextOnClick});

