import { ContextMenuItems } from "../app/const/context-menu-items.const";

const MAX_RECONNECT_ATTEMPTS = 60; // 定義最大重連次數
let reconnectAttempts = 0; // 追蹤目前的重連次數

if (process.env['ENABLE_LIVE_RELOAD']) {

  const connectWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = function (event) {
      console.log("Connected to WebSocket server.");
      reconnectAttempts = 0; // 重連成功時重設重連次數
    };

    socket.onmessage = function (event) {
      if (event.data === "reload") {
        console.log("Reloading extension......");
        // 重新加載擴展
        chrome.runtime.reload();
      }
    };

    socket.onerror = function (error) {
      console.log("WebSocket error: " + error);
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

let contextMenuItems = ContextMenuItems;

chrome.runtime.onInstalled.addListener(() => {

  chrome.storage.local.get(['dictionaryList'], function(result) {
    if (
      !result?.["dictionaryList"] ||
      result?.["dictionaryList"]?.length === 0
    ) {
      chrome.storage.local.set({dictionaryList: contextMenuItems});
    }else{
      contextMenuItems = result["dictionaryList"];
    }
    contextMenuItems.forEach((data) => {
      if (data.visible){
        let item = {
          id: data.id,
          title: data.title + ' ' + data.name,
          contexts: data.contexts,
        } as chrome.contextMenus.CreateProperties;
        chrome.contextMenus.create(item);
      }
    });
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const findItem = contextMenuItems.find((item) => item.id === info.menuItemId);
  const url = findItem?.url;
  const openingMethod = findItem?.openingMethod || 'popup';
  const defaultWidth = findItem?.width || 800;
  const defaultHeight = findItem?.height || 600;
  if (
    url &&
    info.selectionText
  ) {
    const redirectUrl = url + encodeURIComponent(info.selectionText);
    switch (openingMethod) {
      case 'tab':
        chrome.tabs.create({
          url: redirectUrl
        });
        break;
      case 'window':
        (chrome.windows as any).create({
          url: redirectUrl
        });
        break;
      default:
      case 'popup':
        (chrome.windows as any).getCurrent(function(currentWindow: chrome.windows.Window) {
          // 獲取當前窗口的尺寸和位置
          const currentWidth = currentWindow.width || 800;
          const currentHeight = currentWindow.height || 600;
          const currentLeft = currentWindow.left || 0;
          const currentTop = currentWindow.top || 0;

          // 定義新窗口的尺寸 
          let newWidth = defaultWidth > currentWidth ? currentWidth - 150 : defaultWidth;
          let newHeight = defaultHeight > currentHeight ? currentHeight - 150 : defaultHeight;

          if (newWidth < 150) {
            newWidth = 150;
          }

          if (newHeight < 150) {
            newHeight = 150;
          }
        
          // 計算新窗口在屏幕正中間打開的left和top值
          const left = Math.round(currentLeft + (currentWidth - newWidth) / 2);
          const top = Math.round(currentTop + (currentHeight - newHeight) / 2);
        
          // 創建新窗口
          (chrome.windows as any).create({
            url: redirectUrl,
            type: 'panel',
            width: newWidth,
            height: newHeight,
            left: left,
            top: top
          });
        });
        break;
    }
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request?.action === "updateContextMenu") {
    contextMenuItems = request.data;
    chrome.contextMenus.removeAll(() => {
      request.data.forEach((data:any) => {
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