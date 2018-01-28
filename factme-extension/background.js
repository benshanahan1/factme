
// chrome.runtime.onMessage.addListener(
  // function(request, sender, sendResponse) {
    
  //   if (request.status == "factCheckClickResponse") {
  //     console.log(request.text)
  //     chrome.windows.create({"url": 'redirect.html', "type": 'popup'});
  //   }


  //   if (request.greeting == "hello")
  //     sendResponse({farewell: "goodbye"});
  // });

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


// Intentionally create an invalid item, to show off error checking in the
// create callback.
console.log("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    console.log("Got expected error: " + chrome.extension.lastError.message);
  }
});