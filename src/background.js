const MAX_RECONNECT_ATTEMPTS = 60; // 定義最大重連次數
let reconnectAttempts = 0; // 追蹤目前的重連次數

if (ENABLE_LIVE_RELOAD) {

  function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = function (event) {
      console.log("Connected to WebSocket server.");
      reconnectAttempts = 0; // 重連成功時重設重連次數
      isConnecting = false;
    };

    socket.onmessage = function (event) {
      if (event.data === "reload") {
        console.log("Reloading extension......");
        // 重新加載擴展
        chrome.runtime.reload();
      }
    };

    socket.onerror = function (error) {
      console.log("WebSocket error: " + error.message);
    };

    socket.onclose = function (event) {
      console.log("WebSocket connection closed.");
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        // 如果尚未達到最大重連次數，則嘗試重新連接
        reconnectAttempts++;
        console.log(
          `Attempting to reconnect (attempt ${reconnectAttempts})...`
        );
        setTimeout(connectWebSocket, 3000); // 3 秒後重新連接
      } else {
        console.log("Exceeded maximum reconnection attempts.");
      }
    };
  }

  // 連線 WebSocket
  connectWebSocket();

  // 監聽 content-script.js 發送的訊息，並回應
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "wake up!") {
      sendResponse({ result: "OK" });
    }
  });

  console.log("Live reload is enabled");
} else {
  console.log("Live reload is disabled");
}

let contextMenuItems = [
  {
    id: "cambridgeDictionary",
    name: "Cambridge Dictionary",
    url: "https://dictionary.cambridge.org/dictionary/english-chinese-traditional/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "cambridgeDictionaryEn",
    name: "Cambridge Dictionary (English)",
    url: "https://dictionary.cambridge.org/dictionary/english/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"merriamWebsterDictionary",
    name: "Merriam Webster Dictionary",
    url: "https://www.merriam-webster.com/dictionary/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"longmanDictionary",
    name: "Longman Dictionary Dictionary",
    url: "https://www.ldoceonline.com/dictionary/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "collinsDictionary",
    name: "Collins Dictionary",
    url: "https://www.collinsdictionary.com/dictionary/english/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"oxfordDictionary",
    name: "Oxford Dictionary",
    url: "https://www.oxfordlearnersdictionaries.com/definition/english/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "yahooDictionary",
    name: "Yahoo Dictionary",
    url: "https://tw.dictionary.search.yahoo.com/search?p=",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "youGlish",
    name: "YouGlish",
    url: "https://youglish.com/search/",
    title: "Search '%s' in",
    contexts: ["selection"],
    visible: true,
  },
];

chrome.runtime.onInstalled.addListener(() => {

  chrome.storage.local.get(['dictionaryList'], function(result) {
    if (
      !result?.dictionaryList ||
      result?.dictionaryList?.length === 0
    ) {
      chrome.storage.local.set({dictionaryList: contextMenuItems});
    }else{
      contextMenuItems = result.dictionaryList;
    }
    contextMenuItems.forEach((data) => {
      if (data.visible){
        let item = {
          id: data.id,
          title: data.title + ' ' + data.name,
          contexts: data.contexts,
        }
        chrome.contextMenus.create(item);
      }
    });
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const url = contextMenuItems.find((item) => item.id === info.menuItemId)?.url;
  if (
    url &&
    info.selectionText
  ) {
    chrome.tabs.create({
      url: url + encodeURIComponent(info.selectionText)
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request?.action === "updateContextMenu") {
    contextMenuItems = request.data;
    chrome.contextMenus.removeAll(() => {
      request.data.forEach((data) => {
        if (data.visible){
          let item = {
            id: data.id,
            title: data.title + ' ' + data.name,
            contexts: data.contexts,
          }
          chrome.contextMenus.create(item);
        }
      });
    });
  }
  if(
    request?.action === "updateTheme" &&
    request?.data &&
    request?.data?.theme &&
    request?.data?.darkMode
  ) {
    chrome.runtime.sendMessage({
      action: "updateThemeBroadcast",
      data: request.data
    });
  }
});