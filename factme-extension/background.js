var apiURL = "http://138.16.49.17/v1/";
var userID = "234567";


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  guid =  s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
    endpoint ='create_user/' + guid;
    api_post(endpoint=endpoint, payload={}, response =function(data) {
        if (!data) {
          alert("Failed to create user. Reload this page.")
        }
    })
  return guid;  

}

cookieValue = undefined;
chrome.cookies.get({url:"http://fact.me",name:"fact.me"}, function(cookie) {
  if (cookie == null) {
    chrome.cookies.set({url:"http://fact.me",name:"fact.me", expirationDate:2000000000, value:guid()}, function(cookie) {console.log(cookie)})
  }
})


chrome.cookies.get({url:"http://fact.me",name:"fact.me"}, function(cookie) {
  userID = cookie.value;
  console.log(cookie.value)}
  );

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
      
    }
    else if (request.status == "newFact") {
      payload = JSON.stringify(request.text);
      console.log(payload);
      api_post(endpoint=userID, payload=payload, function(data) {
        console.log(data);
        sendResponse({farewell: "goodbye", text: data});
      });
      return true;
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

