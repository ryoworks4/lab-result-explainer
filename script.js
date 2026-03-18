var testInput = document.getElementById('test-input');
var charCount = document.getElementById('char-count');
var generateBtn = document.getElementById('generate-btn');
var resultArea = document.getElementById('result-area');
var copyBtn = document.getElementById('copy-btn');
var catButtons = document.querySelectorAll('.cat-btn');
var levelButtons = document.querySelectorAll('.level-btn');
var exampleTags = document.querySelectorAll('.example-tag');

var selectedCat = 'blood';
var selectedLevel = 'simple';

// 文字数カウント
testInput.addEventListener('input', function () {
    charCount.textContent = this.value.length;
});

// カテゴリ切替
catButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        catButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedCat = this.dataset.cat;
    });
});

// レベル切替
levelButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        levelButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedLevel = this.dataset.level;
    });
});

// サンプルタグクリック
exampleTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
        testInput.value = this.textContent;
        charCount.textContent = this.textContent.length;
        testInput.focus();
    });
});

// 生成実行
generateBtn.addEventListener('click', async function () {
    var testValue = testInput.value.trim();

    if (!testValue) {
        resultArea.innerHTML = '<p class="error-text">検査項目と結果を入力してください</p>';
        return;
    }

    if (testValue.length > 500) {
        resultArea.innerHTML = '<p class="error-text">500文字以内で入力してください</p>';
        return;
    }

    // ローディング表示
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    copyBtn.style.display = 'none';
    resultArea.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

    try {
        var response = await fetch('/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: testValue, category: selectedCat, level: selectedLevel })
        });

        var responseText = await response.text();

        if (!response.ok) {
            var errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: '通信エラーが発生しました' };
            }
            resultArea.innerHTML = '<p class="error-text">' + escapeHtml(errorData.error) + '</p>';
            return;
        }

        var data = JSON.parse(responseText);
        var catLabel = { blood: '血液検査', urine: '尿検査', imaging: '画像検査', physiological: '生理機能検査' };
        var levelLabel = { simple: 'かんたん', standard: 'ふつう', detailed: 'くわしく' };
        resultArea.innerHTML = '<div class="result-content">' +
            '<div class="result-header">' +
            '<span class="result-cat">' + catLabel[selectedCat] + '</span>' +
            '<span class="result-level">' + levelLabel[selectedLevel] + '</span>' +
            '</div>' +
            '<div class="result-text">' + escapeHtml(data.result) + '...</div>' +
            '<p class="demo-note">※ デモ版のため文字数に制限があります</p>' +
            '</div>';
        copyBtn.style.display = 'block';
    } catch (error) {
        resultArea.innerHTML = '<p class="error-text">通信エラーが発生しました。もう一度お試しください。</p>';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '説明を生成する';
    }
});

// コピー
copyBtn.addEventListener('click', function () {
    var resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(function () {
            copyBtn.textContent = 'コピーしました！';
            setTimeout(function () {
                copyBtn.textContent = 'コピー';
            }, 2000);
        });
    }
});

// HTMLエスケープ
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
