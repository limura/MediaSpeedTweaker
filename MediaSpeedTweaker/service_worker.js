import { updatePlaybackRate } from './util.js';

/*
function updatePlaybackRate(playbackRate) {
    chrome.storage.local.set({ 'playbackRate': playbackRate }, function() {
        chrome.tabs.query(
            {active: true, lastFocusedWindow: true, currentWindow: true},
            function(tab) {
                chrome.tabs.sendMessage(tab[0].id, {playbackRate: playbackRate})
            }
        );
    });
}
*/

// ショートカットキーのコマンドを受け取るリスナーを追加
chrome.commands.onCommand.addListener(function(command) {
    if (command === "increase_speed") {
        increasePlaybackSpeed();
    } else if (command === "decrease_speed") {
        decreasePlaybackSpeed();
    } else if (command === "toggle_speed") {
        togglePlaybackSpeed();
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("onMessage:", request);
    switch (request.type) {
        case 'setBadgeTitle':
            chrome.action.setBadgeText({text: request.title});
            chrome.action.setBadgeBackgroundColor({ color: [240, 240, 240, 200] });
            break;
        default:
            break;
    }
})

function increasePlaybackSpeed() {
    chrome.storage.local.get('playbackRate', function(data) {
        let playbackRate = data.playbackRate || 2.0;
        playbackRate += 0.5;
        if (playbackRate >= 16.0) {
            playbackRate = 16.0;
        }
        updatePlaybackRate(playbackRate);
        console.log("YTT: increase:", playbackRate);
    });
}
  
function decreasePlaybackSpeed() {
    chrome.storage.local.get('playbackRate', function(data) {
        let playbackRate = data.playbackRate || 2.0;
        playbackRate -= 0.5;
        if (playbackRate < 0.5) {
            playbackRate = 0.5;
        }
        updatePlaybackRate(playbackRate);
        console.log("YTT: decrease:", playbackRate);
    });
}

function togglePlaybackSpeed() {
    chrome.storage.local.get('playbackRate', function(data) {
        let playbackRate = data.playbackRate || 2.0;
        chrome.tabs.query(
            {active: true, lastFocusedWindow: true, currentWindow: true},
            function(tab) {
                chrome.tabs.sendMessage(tab[0].id, {type: "togglePlaybackSpeed", playbackRate: playbackRate})
            }
        );
    });
}
