function checkDigest(clicked) {
	var types = ["mail","forum","diary","albums","articles","code","qa","writers"];
	var url = "https://annimon.com/json/web/counters?mode=";
	var mode = "";
	
	if (rareupd > 0 || clicked === true) { //обновление всего
		mode = types.join();
		rareupd = 0;
	} else { //обновление главного
		rareupd++;
		if (sets.cbmain.indexOf(true)!==-1)
			for (var i = 0; i<types.length; i++)
				if (sets.cbmain[i]) mode += types[i]+',';
	}
	
	if (sets.cbmiss.indexOf(true)!==-1) { //исключения
		mode = ""; //пересчитываем
		for (var i = 0; i<types.length; i++) {
			if (!sets.cbmiss[i]) mode += types[i]+',';
		}
		if (mode == "") {
			chrome.browserAction.setBadgeText({text: ""});
			if (clicked === true) chrome.runtime.sendMessage({method: "click", error: "none"});
			return;
		}
	}
	
	//console.log(mode);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url+mode, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var json = JSON.parse(xhr.responseText);
			
			if (json.error) { //не авторизован
				if (clicked === true) {
					chrome.tabs.create({ url: "https://annimon.com/in.php", active: false });
					chrome.runtime.sendMessage({method: "click", error: "auth"});
				}
				chrome.browserAction.setBadgeText({text: "?"});
				return;
			}
			
			var num = 0; //всего непрочитанного
			var oldmail = unread.mail; //для уведомлений
			
			for (var key in json) { //кешируем
				if (json.hasOwnProperty(key)) {
					unread[key] = json[key];
				}
			}
			for (var key in unread) { //считаем
				if (unread.hasOwnProperty(key)) {
					num += unread[key];
				}
			}
			
			if (num === 0) num = "";
			chrome.browserAction.setBadgeText({text: ""+num});
			//шлем данные для отображения в меню
			if (clicked === true) chrome.runtime.sendMessage({method: "click", data: unread});
			
			else if (sets.push && unread.mail != oldmail && unread.mail > 0) { //push-уведомления
				var push = chrome.notifications.create("mail", {
					type: 'basic',
					iconUrl: 'icons/page-128.png',
					title: 'ANNChecker',
					message: 'Непрочитанных писем: ' + unread.mail
				});
			}
			
		}
	}
	xhr.send();
}

function start() {
	chrome.storage.local.get("main", function(data) {
		if (data !== undefined && data.main !== undefined) sets = data.main;
		else chrome.storage.local.set({"main": sets});
		rareupd = 0;
		unread = {};
		checkDigest();
		clearInterval(bgrun);
		if (sets.updtime >= 1) bgrun = setInterval(checkDigest, sets.updtime*60000);
	});
}

var rareupd = 0; //более редкое обновление непопулярных модулей
var unread = {}; //объект кэша счетчиков
var sets = { //дефолтные настройки
	cbmain: [true,true,true,true],
	cbmiss: [],
	updtime: 2,
	push: false
}
var bgrun; //цикл
start();

chrome.runtime.onMessage.addListener(function(message, sender, sendRepsonse) {
	if (message.method == "opened") checkDigest(true); //загружаем меню
	if (message.method == "update") start(); //настройки обновлены
});

chrome.notifications.onClicked.addListener(function(id) { //push
	if (id == "mail") chrome.tabs.create({url: "https://annimon.com/mail/?act=new"});
	chrome.notifications.clear(id);
});


























