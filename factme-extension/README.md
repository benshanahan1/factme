# factme Chrome Extension

## Installation

In Google Chrome,

1. Go to 'chrome://extensions/'
2. At the top right, check `Developer Mode`
3. Click 'Load unpacked extension...'
4. Select the entire 'factme-extension/' directory and select 'Open'

## Usage

After installation, an icon will appear in the top right bar (it looks like a little person with arms raised and a check-mark on the shirt).

If the API webserver and database are both running on the same local network (and the appropriate API IP address and port have been specified for the chrome extension (see 'api.js')), you can select some text on a page, right-click, and select "Fact Check". A dialog will open and allow you to input replacement text along with a description. Once you (or anyone else) reloads this same page from now on, the text you selected will be highlighted and they can view your replacement text and description. An upvote and downvote button are provided for any other user to vote on the quality and integrity of your fact-check suggestion.
