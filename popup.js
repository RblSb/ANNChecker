chrome.runtime.sendMessage({method: "opened"}); //оповещение об открытии

function genLink(name, lname, n, n2, custom, custom2) {
	var link = '<a href="https://annimon.com/';
	if (!custom) custom = '/index.php?act=new';
	if (!custom2) custom2 = '/index.php?act=newcm';
	var result = "";
	
	if (n > 0 || n2 > 0) {
		result += '<div class="punmenu">' + link+lname+'">'+name+'</a>' + ' ';
		if (n > 0) result += '<span class="red">'+link+lname+custom+'">+'+n+'</a></span>';
		if (n2 > 0) result += ' '+link+lname+custom2+'">+'+n2+'</a>';
		result += '</div>';
	}
	return result;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.method != "click") return;
	var bmenu = document.getElementById("tagmenu");
	var main = document.getElementById("main");
	var result = "";
	
	if (message.error == "auth") {
		main.innerHTML = 'Требуется<br>авторизация.';
		return true;
		
	} else if (message.error == "none") {
		main.innerHTML = "Ты все заблокировал, умник!";
		return true;
	}
	
	var data = message.data;
	result += genLink("Почта", "mail", data.mail);
	result += genLink("Форум", "forum", data.forum);
	result += genLink("Дневники", "dnevniki", data.diaries, data.diaries_comments);
	result += genLink("Альбомы", "albums", data.albums, data.albums_comments);
	result += genLink("Статьи", "ablogs", data.articles, data.articles_comments);
	result += genLink("Коды", "code", data.code, data.code_comments);
	result += genLink("Вопросы и ответы", "qa", data.qa_questions, data.qa_answers, '/unread', '/?act=last_answers&unread');
	result += genLink("Уголок писателя", "write", data.writers, data.writers_comments);
	
	if (result !== "") main.innerHTML = result;
	else main.innerHTML = "Все прочитано.";
	
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			var location = ln.href;
			ln.onclick = function () {
				chrome.tabs.create({url: location});
				window.close();
			}
		})();
	}
	
	return true;
});



















