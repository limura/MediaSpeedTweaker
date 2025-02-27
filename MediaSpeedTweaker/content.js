async function getPlaybackRate() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('playbackRate', (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data.playbackRate);
            }
        });
    });
}

function UpdateBadge(text){
    chrome.runtime.sendMessage({type: "setBadgeTitle", title: text});
    console.log("setBadgeText:", text);
}

function ChangeMediaSpeed(playbackRate){
    const target = "video,audio";
    document.querySelectorAll(target)?.forEach((media)=>{
        media.playbackRate = playbackRate;
    });
    displayPlaybackSpeed(playbackRate);
}

function displayPlaybackSpeed(playbackRate) {
    // オーバーレイ要素を作成
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = 'white';
    overlay.style.padding = '5px 10px';
    overlay.style.borderRadius = '5px';
    overlay.style.fontSize = '16px';
    overlay.style.zIndex = '9999';
  
    // 再生速度を表示
    overlay.textContent = `Playback Speed: ${playbackRate.toFixed(1)}`;
  
    // ページにオーバーレイを追加
    document.body.appendChild(overlay);
  
    // アニメーション: 0.5秒で薄くし、0.5秒で透明にしてから削除
    overlay.style.transition = 'opacity 0.5s, background-color 0.5s';
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }, 500); // 0.5秒後に薄くする
    setTimeout(() => {
        document.body.removeChild(overlay);
    }, 1000); // 1秒後にオーバーレイを削除

    UpdateBadge(playbackRate.toFixed(1));
}
  
function isDisableSite() {
    return window.location.href.startsWith('https://www.youtube.com/');
}

async function WatchVideoElement(videoElement){
    //if (isDisableSite()) { return; }
    var currentSrc = null;
    let targetPlaybackRate = await getPlaybackRate();

    const addWatcher = function(mutationsList, observer) {
        //console.log("YTT: adWatcher in:", mutationsList);
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (let addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        const buttonElement = addedNode.querySelector('.ytp-skip-ad-button') || addedNode.querySelector('.ytp-ad-skip-button-text') || addedNode.querySelector('.ytp-ad-skip-button-modern');
                        if (buttonElement) {
                            setTimeout(()=>{
                                console.log("YTT: addedNode.querySelector('.ytp-ad-skip-button-text').click()");
                                //buttonElement.click();
                            }, 4000);
                            return;
                        }
                        const previewText = addedNode.querySelector('.ytp-ad-preview-text') || addedNode.querySelector('.ytp-ad-preview-text-modern') || addedNode.querySelector('.ytp-ad-text');
                        if (previewText){
                            //videoElement.playbackRate = 2; // = 16;
                            console.log("YTT: addedNode.querySelector('.ytp-ad-preview-text') found. speed to 2 (not 16)", location.href);
                            return;
                        }
                    }
                }
            }
        }
    };
    let adWatchElement = videoElement.parentElement?.parentElement;
    if (adWatchElement) {
        //(new MutationObserver(addWatcher)).observe(adWatchElement, { childList: true, subtree: true });
    }

    const srcChangeCallback = async function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes') {
                if ( mutation.attributeName === 'src') {
                    // src属性が変更された場合の処理
                    const videoSrc = videoElement.getAttribute('src');
                    if (!videoSrc || currentSrc == videoSrc) {
                        console.log("YTT: return (!videoSrc || currentSrc == videoSrc)", videoSrc, currentSrc, currentSrc == videoSrc);
                        return;
                    }
                    setTimeout(async ()=>{
                        // 通常時に呼び出される(v=... のURLでリロードした時とか)
                        console.log("YTT: video.src change. location.href:", location.href, "currentSrc:", currentSrc, 'new video.src:', videoSrc, Date.now());
                        if (!videoSrc) {
                            currentSrc = videoSrc;
                        }
                        if (document.querySelector(".ytp-preview-ad")) {
                            console.log("YTT: .ytp-preview-ad found. playbackRate not change.");
                            return;
                        }else{
                            console.log("YTT: .ytp-preview-ad not found.", Date.now());
                        }
                        if (document.querySelector('.ytp-ad-module')?.childNodes?.length > 0) {
                            console.log("YTT: .ytp-ad-module found. playbackRate not change.");
                            return;
                        }else{
                            let length = document.querySelector('.ytp-ad-module')?.childNodes?.length;
                            console.log("YTT: .ytp-ad-module not found?", document.querySelector('.ytp-ad-module'), length, Date.now());
                            if (length > 0) {
                                console.log("YTT: .ytp-ad-module found. playbackRate not change. (length > 0)");
                                return;
                            }
                        }
                        /*
                        if (videoElement.playbackRate == 1 && videoSrc.includes('youtube.com/')) {
                            console.log("YTT: video.playbackRate == 1 and playing youtube. playbackRate not change.", videoSrc);
                            continue;
                        }else{
                            console.log("YTT: video.playbackRate != 1 or not playing youtube.", videoElement.playbackRate, videoSrc, Date.now());
                        }*/
                        const playbackRate = await getPlaybackRate();
                        console.log("YTT: playbackRate override:", playbackRate, "from:", videoElement.playbackRate, Date.now());
                        videoElement.playbackRate = playbackRate;
                        UpdateBadge(playbackRate.toFixed(1));
                    }, 1000);
                }
            }
        }
    };
    const config = { attributes: true, attributeFilter: ['src'] };

    const observer = new MutationObserver(srcChangeCallback);
    observer.observe(videoElement, config);
    // srcChangeCallback は値が変わらないと呼ばれないので初回は素で起動しておきます
    srcChangeCallback([
        {
            type: 'attributes',
            attributeName: 'src'
        }
    ], null);

    // videoElement の速度が変わった時のイベントハンドラ
    let previousRateChangeTime = undefined;
    videoElement.addEventListener('ratechange', async ()=>{
        let targetRate = await getPlaybackRate();
        let currentTime = new Date().getTime();
        if (videoElement.playbackRate != targetRate && videoElement.playbackRate != 16) {
            if (previousRateChangeTime !== null) {
                let timeDifference = currentTime - previousRateChangeTime;
                if (timeDifference < 1000/10) { // 0.1秒未満で再度？呼び出された
                    return;
                }
            }
            console.log("YTT: video.playbackRate changed. override.", videoElement.playbackRate, targetRate);
            //videoElement.playbackRate = targetRate;
            //UpdateBadge(targetRate.toFixed(1));
            previousRateChangeTime = currentTime;
        }
    });
}

// body以下に video エレメントが追加される場合について監視するコールバック
function bodyCallback(mutationsList, bodyObserver) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedNodes = Array.from(mutation.addedNodes);
            addedNodes.forEach(addedNode => {
                if (addedNode.nodeType === Node.ELEMENT_NODE && addedNode.tagName === 'VIDEO') {
                    // 新しいvideo要素が追加された場合、一瞬遅れてMutationObserverを設定
                    setTimeout(()=>{WatchVideoElement(addedNode)}, 10);
                }
            });
        }
    });
}
// body以下に新しいvideo要素が追加された場合を監視
const bodyObserver = new MutationObserver(bodyCallback);
bodyObserver.observe(document.body, { childList: true, subtree: true });

// 既存のvideo要素にMutationObserverを設定
document.querySelectorAll('video')?.forEach(videoElement => {
    WatchVideoElement(videoElement);
});

async function togglePlaybackSpeed(playbackRate) {
    let targetPlaybackRate = await getPlaybackRate();
    const target = "video,audio";
    var setRate = targetPlaybackRate;
    document.querySelectorAll(target)?.forEach((media)=>{
        if (media.playbackRate == 1) {
            media.playbackRate = targetPlaybackRate;
            UpdateBadge(targetPlaybackRate.toFixed(1));
            console.log("YTT: togglePlaybackSpeed: 1 to ", targetPlaybackRate, media);
            setRate = targetPlaybackRate;
        } else {
            media.playbackRate = 1;
            UpdateBadge(1);
            console.log("YTT: togglePlaybackSpeed: change to 1 ", targetPlaybackRate, media);
            setRate = 1;
        }
    });
    displayPlaybackSpeed(setRate);
}

// popup.js からの速度変更イベントを受け取る
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("onMessage:", request);
    switch (request.type) {
        case 'overridePlaybackSpeed':
            if (request.playbackRate) {
                ChangeMediaSpeed(parseFloat(request.playbackRate))
            }
            break;
        case 'togglePlaybackSpeed':
            togglePlaybackSpeed(parseFloat(request.playbackRate));
            break;
        default:
            break;
    }
});