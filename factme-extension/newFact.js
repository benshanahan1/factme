var apiURL = "http://138.16.49.17/v1/"

function submitDescription(replacement,description) {
  console.log(replacement, description)
}


document.getElementById("submitButton").onclick = function() {
  replacement = document.getElementById("replacementText").value
  description = document.getElementById("descriptionText").value
  
};

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {

//     if (request.status == "newFact") {
// 	   selection = request.text
//      alert(selection)
//    }
//     else if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });