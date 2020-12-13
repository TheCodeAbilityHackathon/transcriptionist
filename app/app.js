function exportHistory() {
var conversations = document.querySelectorAll('#textarea li');
if (conversations.length<1) {
Metro.infobox.create('Ta funkcja służy do zapisu historii rozmowy do pliku.<br/>Na razie nie ma żadnej historii. Kliknij tutaj po spotkaniu :)','info');

return false;
}
var text = "Historia transkrypcji spotkania\n\n";
for (step = 0; step < conversations.length; step++) {
if (conversations[step].classList.contains('ext')) {
text = text + "Uczestnik spotkania: ";
} else {
text = text + "Ja : ";
}
text = text+conversations[step].innerText+"\n";
}
    blob = new Blob([text], { type: 'text/plain' }),
    anchor = document.createElement('a');
var d = new Date();
anchor.download = "transkrypcja_spotkania_"+d.toLocaleDateString('pl-PL')+".txt";
anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
anchor.click();
}
function say() {
    document.querySelector('#speakingBar').style.display = "block";
  
    var what = document.querySelector('#what').value;
        document.querySelector('#textarea').insertAdjacentHTML('beforeend', '<li  ondblclick="javascript:reSpeak(this)" class="int">' + what + '&nbsp;<span class="mif-mic"></span></li>');
  const lang = 'pl-PL';
    var msg = new SpeechSynthesisUtterance();
    var voices = speechSynthesis.getVoices();
    var select = Metro.getPlugin('#audioSelector', 'select');
    //select.val()
    msg.voice = voices[parseInt(select.val())];
    langRecon = voices[parseInt(select.val())].lang;
    console.log(voices[parseInt(select.val())]);
    temp = '<?xml version="1.0"?><speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis11/synthesis.xsd" xml:lang="en-US">';
    temp = temp + what + '</speak>';
    msg.text = what;
    //  msg.lang = lang;
    msg.onend = function(event) {
        document.querySelector("#what").value = "";
        document.querySelector("#what").focus();
        document.querySelector('#speakingBar').style.display = "block";
       // document.querySelector('#textarea').insertAdjacentHTML('beforeend', '<li  class="int">' + what + '&nbsp;<span class="mif-mic"></span></li>');
if (document.querySelector('.interim')) {
		document.querySelectorAll('.interim').forEach(e => e.classList.remove('interim'));
	}   
     lastInput = what;
        rescroll();
    }
    window.speechSynthesis.speak(msg);
	


}
var lastInput = "";
function reSpeak(e) {
document.querySelector('#what').value = e.innerText.trim();
say();
}
function setWindowHeight() {
    var windowHeight = window.innerHeight;
    document.body.style.height = windowHeight + "px";
    console.log(document.body.style.height);
}
window.addEventListener("resize", setWindowHeight, false);

function rescroll() {
    var objDiv = document.getElementById("textarea");
    objDiv.scrollTop = objDiv.scrollHeight;
}
function showInfo() {
window.open("https://monito.cloud/mowmi/help/#/");
}
function changeFont(number) {
if (!recognizing) {
	
Metro.infobox.create('Ta funkcja służy do zmiany rozmiaru czcionki w oknie zapisu rozmowy. Zmiany będą widoczne po rozpoczęcoiu rozmowy','info');
}
var el = document.querySelector('body');
var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
var fontSize = parseFloat(style); 
// now you have a proper float for the font size (yes, it can be a float, not just an integer)
el.style.fontSize = (fontSize + number) + 'px';
}
var timer = setInterval(function() {
    var voices = speechSynthesis.getVoices();
    console.log(voices);
    if (voices.length != 0) {
        clearInterval(timer);
        var select = Metro.getPlugin('#audioSelector', 'select');
        var langs = [];
        for (i = 0; i < voices.length; i++) {
            var x = new Object();
            x[i] = voices[i].name;
            console.log(x);
            langs.push(x);
        }
        select.data(langs);
        select.val(window.localStorage.getItem('voice'));
		document.querySelectorAll('div.prepend')[0].title="Wybierz, w jakim języku aplikacja ma słuchać i czytać teksty";
		document.querySelectorAll('div.prepend')[1].title="Napisz, co asystent głosowy powie w Twoim imieniu na spotkaniu";
    }
}, 1000);

var input = document.getElementById("what");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        say();
    }
});
var recognizing = false;
var recognition = new webkitSpeechRecognition();
function canAdd() {
var temp = document.querySelectorAll('.ext');
var l1 = temp[temp.length-1];
var l2 = temp[temp.length];
if (l1 && l2) {
if (l1.innerText==l2.innerText) { return false;} else { return true;}
} else {
return true;
}
}
(function() {
    setTimeout(function() {
        document.querySelectorAll('div.input')[1].style.display = "none";

        var button = document.querySelector('#button');
        var textarea = document.querySelector('textarea');

        recognition.interimResults = true;


        recognition.continuous = true;
        reset();
        recognition.onend = reset();
        recognition.onresult = function(event) {
            console.log(event);
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i]) {
                    //jesli nie final to do ostatniego exta 
                    //jesli final przypisz i usun modifier
                    var reg = new RegExp(lastInput, "gi");
                    var transcript = event.results[i][0].transcript.replace(reg, '');
					console.log("Transcript = "+transcript);
                    if (transcript.trim().length < 1) {  } else {
                        var elem = document.querySelector('.interim');
                        if (elem) {
                            document.querySelector('.interim').innerHTML = "<span class=\"mif-mic\"></span>&nbsp" + transcript;
                        } else {
                            document.querySelector('#textarea').insertAdjacentHTML('beforeend', "<li class='ext interim'><span class=\"mif-mic\"></span>&nbsp;" + transcript + "</li>");
                        }
                    }

                }
                if (event.results[i].isFinal) {
					var transcript = event.results[i][0].transcript.replace(reg, '');
					if ((transcript.trim().length>0) && (canAdd())) {
						document.querySelector('#textarea').insertAdjacentHTML('beforeend', "<li class='ext '><span class=\"mif-mic\"></span>&nbsp;" + transcript + "</li>");
						document.querySelectorAll('.interim').forEach(e => e.classList.remove('interim'));
					}
                }
                rescroll();
            }
        }
    }, 1000);

})();




function reset() {
    var button = document.querySelector('#button');
    recongnizing = false;
    recognition.stop();

}

function toggleStartStop() {


    var voices = speechSynthesis.getVoices();
    var select = Metro.getPlugin('#audioSelector', 'select');
    //select.val()
    recognition.lang = voices[parseInt(select.val())].lang;
    window.localStorage.setItem('voice', select.val());

    if (recognizing) {
				document.querySelectorAll('label.input-normal')[0].style.display = "flex";
		document.querySelectorAll('div.input')[1].style.display = "none";
document.querySelector('#textarea').style.visibility = "hidden";

        document.querySelector('#button').classList.remove("buttonSmall");
        document.querySelectorAll('ul li').forEach(e => e.remove());
        document.querySelector('.mif-record_voice_over').classList.remove("iconSmall");
        document.querySelector('#button').title = 'Kliknij tutaj aby włączyć słuchanie! Następnie dołącz do spotkania online';
        recognition.stop();
        recognizing = false;
        //reset();
        console.log("PRZERYWAM");
    } else {
		document.querySelectorAll('label.input-normal')[0].style.display = "none";
		document.querySelector('#textarea').style.visibility = "visible";

        document.querySelectorAll('div.input')[1].style.display = "flex";
        document.querySelector('#button').title = 'Kliknij tutaj aby wyłączyć słuchanie!';
        document.querySelector('#button').classList.add("buttonSmall");
        document.querySelector('.mif-record_voice_over').classList.add("iconSmall");
        var voices = speechSynthesis.getVoices();
        var select = Metro.getPlugin('#audioSelector', 'select');
        //select.val()
        recognition.lang = voices[parseInt(select.val())].lang;

        recognition.start();
        recognizing = true;
        console.log("ZACZYNAM");

    }
}

setTimeout(function() {
    document.querySelector('body').classList.add("final");
    document.querySelector('#content').classList.add('contentShown');
    document.querySelector('#logo').classList.add("logoHidden");
}, 5000);