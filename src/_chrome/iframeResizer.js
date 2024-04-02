// iframeResizer.js
function setIframeHeight(iframeId) {
  var iframe = document.getElementById(iframeId);
  if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
    var iframeContent = iframe.contentWindow.document;
    iframe.style.height = iframeContent.body.scrollHeight + "px";
    iframe.style.width = iframeContent.body.scrollWidth + "px";
  }
}

function observeIframeLoad(iframeId) {
  var iframe = document.getElementById(iframeId);
  if (iframe) {
    // 當iframe載入完成時設定高度
    iframe.addEventListener("load", function () {
      setIframeHeight(iframeId);

      // 監聽iframe內部文檔的變化
      var body = iframe.contentDocument.body;
      var config = { attributes: true, childList: true, subtree: true };
      var observer = new MutationObserver(function (mutations) {
        setIframeHeight(iframeId);
      });
      observer.observe(body, config);
    });
  }
}

// 監聽DOM是否加載完畢，然後觀察iframe
document.addEventListener("DOMContentLoaded", function () {
  observeIframeLoad("mainFrame");
});
