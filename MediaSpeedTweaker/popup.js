import { updatePlaybackRate } from './util.js';

document.addEventListener('DOMContentLoaded', function() {
    var speedSelect = document.getElementById('speedSelect');
  
    // ポップアップを開いたときにローカルストレージから設定を読み込む
    chrome.storage.local.get('playbackRate', function(data) {
        var playbackRate = data.playbackRate || 2.0; // デフォルト値を設定
        speedSelect.value = playbackRate.toString();
    });
  
    // 選択された再生速度を保存
    speedSelect.addEventListener('change', function() {
        var selectedSpeed = parseFloat(speedSelect.value);
        updatePlaybackRate(selectedSpeed);
    });
});
