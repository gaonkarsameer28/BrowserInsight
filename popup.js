document.getElementById("downloadLogs").addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "downloadHAR" }, function(response) {
        if (response.success) {
            alert("HAR file downloaded successfully!");
        } else {
            alert("Failed to download HAR file.");
        }
    });
});
