function saveOptions() {
	var save = {
		updtime: Math.floor(document.getElementById("updtime").value),
		push: document.getElementById("push").checked,
		cbmain: [],
		cbmiss: []
	}
	
	for (var i = 0; i < 8; i++) {
		save.cbmain[i] = document.getElementById("cbmain_"+i).checked;
		save.cbmiss[i] = document.getElementById("cbmiss_"+i).checked;
	}
	
	document.getElementById("save").innerHTML = "Сохранение...";
	chrome.storage.local.set({"main": save}, function() {
		document.getElementById("save").innerHTML = "Сохранено!";
		chrome.runtime.sendMessage({method: "update"}); //оповещение
	});
}

function loadOptions() {
	chrome.storage.local.get("main", function(data) {
		if (data === undefined || data.main === undefined) return;
		else data = data.main;
		
		document.getElementById("updtime").value = data.updtime;
		document.getElementById("push").checked = data.push;
		
		for (var i = 0; i < 8; i++) {
			document.getElementById("cbmain_"+i).checked = data.cbmain[i] || false;
			document.getElementById("cbmiss_"+i).checked = data.cbmiss[i] || false;
		}
	});
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.getElementById("save").onclick = saveOptions;