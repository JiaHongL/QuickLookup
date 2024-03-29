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
    title: "Search '%s' in Cambridge Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "cambridgeDictionaryEn",
    name: "Cambridge Dictionary (English)",
    title: "Search '%s' in Cambridge Dictionary (English)",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"merriamWebsterDictionary",
    name: "Merriam Webster Dictionary",
    title: "Search '%s' in Merriam Webster Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"longmanDictionary",
    name: "Longman Dictionary Dictionary",
    title: "Search '%s' in Longman Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "collinsDictionary",
    name: "Collins Dictionary",
    title: "Search '%s' in Collins Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id:"oxfordDictionary",
    name: "Oxford Dictionary",
    title: "Search '%s' in Oxford Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "yahooDictionary",
    name: "Yahoo Dictionary",
    title: "Search '%s' in Yahoo Dictionary",
    contexts: ["selection"],
    visible: true,
  },
  {
    id: "youGlish",
    name: "YouGlish",
    title: "Search '%s' in YouGlish",
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
          title: data.title,
          contexts: data.contexts,
        }
        chrome.contextMenus.create(item);
      }
    });
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "yahooDictionary":
      if (info.selectionText) {
        const url = `https://tw.dictionary.search.yahoo.com/search?p=${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "cambridgeDictionary":
      if (info.selectionText) {
        const url = `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "cambridgeDictionaryEn":
      if (info.selectionText) {
        const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "merriamWebsterDictionary":
      if (info.selectionText) {
        const url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "youGlish":
      if (info.selectionText) {
        const url = `https://youglish.com/search/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "longmanDictionary":
      if (info.selectionText) {
        const url = `https://www.ldoceonline.com/dictionary/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "collinsDictionary":
      if (info.selectionText) {
        const url = `https://www.collinsdictionary.com/dictionary/english/${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({ url });
      }
      break;
    case "oxfordDictionary":
      if (info.selectionText) {
        const url = `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(info.selectionText.toLowerCase())}?q=${encodeURIComponent(info.selectionText.toLowerCase())}`;
        chrome.tabs.create({ url });
      }
      break;
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request?.action === "updateContextMenu") {
    chrome.contextMenus.removeAll(() => {
      request.data.forEach((data) => {
        if (data.visible){
          let item = {
            id: data.id,
            title: data.title,
            contexts: data.contexts,
          }
          chrome.contextMenus.create(item);
        }
      });
    });
  }
});