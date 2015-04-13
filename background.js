/*!
 * Web Sniffer v0.0.0.1 (http://5ms.ru/sniffer/)
 * Copyright 2014, 5MS
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 */


var tabExt = null,
	port = null;

chrome.browserAction.onClicked.addListener(function() {

	if (tabExt != null) {

		chrome.tabs.update(tabExt.id, {selected: true});
		chrome.windows.update(tabExt.windowId, {focused: true});

		return false;
	}

	chrome.browserAction.setBadgeText({text: "run"});
	chrome.browserAction.setTitle({title: "Open Web Sniffer"});

	chrome.tabs.create({url:chrome.extension.getURL("index.html")}, function(tab) {

		tabExt = tab;

		var onBeforeRequest_callback = function(details) {

				if (details.tabId > 0) {

					chrome.tabs.get(details.tabId, function (tab) {

						port.postMessage({Type: 'Request', Details: details, TabInfo: tab});

						//This  {"frameId":0,"fromCache":true,"ip":"74.125.236.63","method":"GET","parentFrameId":-1,"requestId":"563","statusCode":200,"statusLine":"HTTP/1.1 200 OK","tabId":64,"timeStamp":1359389270317.956,"type":"image","url":"http://www.google.co.in/images/srpr/logo3w.png"} Web request is from this 64 tab and its details are{"active":true,"highlighted":true,"id":64,"incognito":false,"index":4,"pinned":false,"selected":true,"status":"loading","title":"Google","url":"http://www.google.co.in/","windowId":1}
						//console.log("This  " + JSON.stringify(details) + " Web request is from this " + tab.id + " tab and its details are" + JSON.stringify(tab));
					});

				} else {

					port.postMessage({Type: 'Request', Details: details});
				}

				return {};
			},
			onBeforeSendHeaders_callback = function(details) {
				port.postMessage({Type: 'SendHeaders', Details: details});
				return {};
			},
			onHeadersReceived_callback = function(details) {
				port.postMessage({Type: 'Received', Details: details});
				return {};
			},
			onCompleted_callback = function(details) {
				port.postMessage({Type: 'Completed', Details: details});
				return {};
			},
			onErrorOccurred_callback = function(details) {
				port.postMessage({Type: 'ErrorOccurred', Details: details});
				return {};
			},
			onUpdated_callback = function(tabId, changeInfo, tab) {

				if (changeInfo.status == "complete" && tab.id == tabExt.id) {

					port = chrome.tabs.connect(tab.id);
				}
			},
			onRemoved_callback = function(tabId) {

				if (tabId == tabExt.id) {

					tabExt = null;

					//chrome.tabs.remove(tabId);

					chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest_callback);
					chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders_callback);
					chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived_callback);
					chrome.webRequest.onCompleted.removeListener(onCompleted_callback);
					chrome.webRequest.onErrorOccurred.removeListener(onErrorOccurred_callback);
					chrome.tabs.onUpdated.removeListener(onUpdated_callback);
					chrome.tabs.onRemoved.removeListener(onRemoved_callback);

					chrome.browserAction.setBadgeText({text: ""});
					chrome.browserAction.setTitle({title: "Start Web Sniffer"});
				}
			};

		chrome.tabs.onUpdated.addListener(onUpdated_callback);
		chrome.tabs.onRemoved.addListener(onRemoved_callback);

		chrome.webRequest.onBeforeRequest.addListener(
			onBeforeRequest_callback,
			{urls: ["<all_urls>"]},
			["blocking", "requestBody"]
		);

		chrome.webRequest.onBeforeSendHeaders.addListener(
			onBeforeSendHeaders_callback,
			{urls: ["<all_urls>"]},
			["blocking", "requestHeaders"]
		);

		chrome.webRequest.onHeadersReceived.addListener(
			onHeadersReceived_callback,
			{urls: ["<all_urls>"]},
			["blocking", "responseHeaders"]
		);

		chrome.webRequest.onCompleted.addListener(
			onCompleted_callback,
			{urls: ["<all_urls>"]},
			["responseHeaders"]
		);

		chrome.webRequest.onErrorOccurred.addListener(
			onErrorOccurred_callback,
			{urls: ["<all_urls>"]}
		);

	});

	return {};
});

