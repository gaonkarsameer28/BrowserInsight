// HAR log structure
const harLog = {
    log: {
        version: "1.2",
        creator: {
            name: "Tab Inside",
            version: "1.0"
        },
        entries: []
    }
};

// Capture network requests and add them to HAR log
chrome.webRequest.onCompleted.addListener(
    function (details) {
        const entry = {
            startedDateTime: new Date(details.timeStamp).toISOString(),
            time: 0, // Adjust if you want to calculate actual timings
            request: {
                method: details.method,
                url: details.url,
                headers: [], // Populate if headers are needed
                queryString: [], // Populate if query params are needed
                cookies: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: details.statusCode,
                statusText: details.statusLine || "OK",
                headers: [], // Populate if headers are needed
                cookies: [],
                content: {
                    size: details.responseHeaders ? details.responseHeaders.length : 0,
                    mimeType: details.type
                },
                redirectURL: "",
                headersSize: -1,
                bodySize: -1
            },
            cache: {},
            timings: {
                blocked: -1,
                dns: -1,
                connect: -1,
                send: 0,
                wait: details.timeStamp,
                receive: 0,
                ssl: -1
            }
        };

        harLog.log.entries.push(entry);
    },
    { urls: ["<all_urls>"] }
);

// Download HAR file
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadHAR") {
        const blob = new Blob([JSON.stringify(harLog, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "network_log.har";
        a.click();
        URL.revokeObjectURL(url);

        sendResponse({ success: true });
    }
});

// Set up an alarm to auto-download the HAR file every 1 minute
chrome.alarms.create("autoDownloadHAR", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "autoDownloadHAR") {
        autoSaveHAR();
    }
});

// Function to save HAR file automatically
function autoSaveHAR() {
    const blob = new Blob([JSON.stringify(harLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: `network_log_${Date.now()}.har`,  // Correctly use backticks
        saveAs: false
    });

    URL.revokeObjectURL(url);
}
