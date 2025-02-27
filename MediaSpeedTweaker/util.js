export function updatePlaybackRate(playbackRate) {
    chrome.storage.local.set({ 'playbackRate': playbackRate }, function() {
        chrome.tabs.query(
            {active: true, lastFocusedWindow: true, currentWindow: true},
            function(tab) {
                chrome.tabs.sendMessage(tab[0].id, {type: "overridePlaybackSpeed", playbackRate: playbackRate})
            }
        );
    });
}