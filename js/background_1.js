// backgroud_1.js

/*  This file is part of ChromeCast (Chrome Extension)
Copyright (C) 2010 Binomed (binomed.team@gmail.com) 

This library is free software; you can redistribute it and/or 
modify it under the terms of the GNU Library General Public 
License as published by the Free Software Foundation; version 2 
of the License. 

This library is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU 
Library General Public License for more details. 

You should have received a copy of the GNU Library General Public License 
along with this library; see the file COPYING.LIB.  If not, write to 
the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
Boston, MA 02110-1301, USA. 
*/ 

// Variables

var response;

var meta = {};
var podcasts = new Array();

var numplaying = 0;
var playing = false;
var nowplaying = "";
var idplaying = "";

var curFeed;
var curPod;
var curTime = 0;
var curDuration = 0;

var player;
			
var feedsString = localStorage.getItem("feeds");

if (feedsString == undefined) { var feeds = []; }
else { var feeds = JSON.parse(feedsString); }

// Fonctions

/** ACCESSEURS **/
var isPlaying = function() { return playing; }
var titlePlaying = function() { return nowplaying; }
var idPlaying = function() { return idplaying; }
var numPlaying = function() { return numplaying; }
var getVolume = function() { return player.volume; }
var setVolume = function(vol) { player.volume = vol; }
var getCurFeed = function() { return curFeed; }
var getCurPod = function() { return curPod; }
var getCurTime = function() { return curTime; }
var getCurDuration = function() { return curDuration; }

/**
 * Fonction qui permet d'ajouter un feed
 */                 
var addFeed = function(feed) {
	// Vérification si le feed n'existe pas déjà
	for(i = 0; i < feeds.length; i++) {
		if(feeds[i].url == feed) { return; }
	}

	// Si le feed n'existe pas on peut l'ajouter
	var obj = {"url":feed};                  
	feeds.push(obj);

	//console.log(feeds);

	// On recharge les flux, et on sauvegarde
	// les données
	loadpage();
	// saveFeeds(); 
}

/**
 * Fonction qui permet de supprimer un feed
 */                 
var delFeed = function(feed) {
	var blntrouve = false;
	var num;

	// On va vérifier que le flux existe bien
	for(i = 0; i < feeds.length; i++) {
		if(feeds[i].url == feed) {
			blntrouve = true;
			num = i; 
		}
	}
  
	// Si le feed existe on va le supprimer, recharger les flux
	// et sauvegarder les données
	if(blntrouve) {
		feeds.splice(num, 1);
		loadpage();
		saveFeeds();
	}
}

/**
 * Fonction qui permet de récupérer le titre d'un feed en
 * fonction de son URL
 */                          
var getTitleByUrl = function(url) {
	// On va rechercher le feed par son url
	for(i = 0; i < feeds.length; i++) {
		// Si on a trouvé le feed, on retourne son titre
		if(feeds[i].url == url) { return feeds[i].title; }
	}

	// Si le feed n'existe pas, on retourne une chaîne vide
	return "";
}

/**
 * Fonction qui sauvegarde les feeds en base
 */                 
var saveFeeds = function() { localStorage.setItem('feeds', JSON.stringify(feeds)); }

/**
 * Accesseur aux feeds 
 */                  
var getFeeds = function() { return feeds; }

/**
 * Fonction qui va afficher les feeds
 */                 
function afficheUnread() {
	podcasts = new Array();
	var items = response.getElementsByTagName("item");

	if(response.getElementsByTagName('image')[0].getElementsByTagName('url').length > 0) {
		meta.img = response.getElementsByTagName('image')[0].getElementsByTagName('url')[0].childNodes[0].nodeValue;        
	} else {
		meta.img = "";
	}

	var title = response.getElementsByTagName('title')[0].childNodes[0].nodeValue;
	var subtitle = response.getElementsByTagName('description')[0].childNodes[0].nodeValue;

	meta.title = title;
	meta.subtitle = subtitle;

	for(i = 0; i < items.length; i++) {
		var podcast = {};

		podcast.guid = items[i].getElementsByTagName('guid')[0].childNodes[0].nodeValue;
		podcast.title = items[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
		podcast.subtitle = items[i].getElementsByTagNameNS('itunes','subtitle')[0].childNodes[0].nodeValue;		
		podcast.url = items[i].getElementsByTagName('enclosure')[0].getAttribute("url");
		
		if(podcast.url != "") 
			podcasts.push(podcast);
	}

	meta.podcasts = podcasts;

	//chrome.browserAction.setBadgeText({'text':items.length + ''});

	var viewPopupUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}

	if (blntrouve) { popupview.affiche(); }
}
	  
/**
 * Fonction Play/Pause
 */                           
function togglePlay() {
	// Si le lecteur est en pause, alors on passe en "play"
	if(player.paused) {
		player.play();
		playing = true;
	// Si le lecteur est en play, alors on passe en "pause"
	} else {
		player.pause();
		playing = false;
	}

	var viewPopupUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		//console.log("View : " + views[i].location.href);
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}

	if(blntrouve) { popupview.displayPlaying(); }           
}

/**
 * Fonction Play/Pause pour un podcast donné
 */                 
function togglePlayPodcast(numfeed, numpodcast) {
	var podcast = feeds[numfeed].podcasts[numpodcast];
	console.log("Podcast " + numfeed + ", " + numpodcast + " : number " + feeds[numfeed].podcasts.length);
	numplaying  = parseInt(numpodcast)+1;

	if(numfeed != curFeed || numpodcast != curPod) {                
		player.src = podcast.url;
		player.load();
		nowplaying = podcast.subtitle;
		idplaying = podcast.guid;
		curFeed = numfeed;
		curPod = numpodcast;
	}

	if(player.paused) {
		player.play();
		playing = true;
	} else {
		player.pause();
		playing = false;
	}

	var viewPopupUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		//console.log("View : " + views[i].location.href);
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}

	if(blntrouve) { popupview.displayPlaying(); } 
	
}

/**
 * Fonction qui joue le prochain podcast
 */                 
function playNext() {  
	if(curPod == feeds[curFeed].podcasts.length-1) {
		if(curFeed == feeds.length-1) {
			togglePlayPodcast(0,0);
		} else {
			togglePlayPodcast(parseInt(curFeed)+1,0);
		}
	} else {
		togglePlayPodcast(curFeed, parseInt(curPod)+1);
	}
	
	display();
}

/**
 * Fonction qui joue le précédent podcast
 */                 
function playPrevious() { 
	if(curPod == 0) {
		if(curFeed == 0) {
			togglePlayPodcast(feeds.length-1, feeds[feeds.length-1].podcasts.length-1);
		} else {
			togglePlayPodcast(parseInt(curFeed)-1,feeds[curFeed-1].podcasts.length-1);
		}
	} else {
		togglePlayPodcast(curFeed, parseInt(curPod)-1);
	}
	
	display();
}


/**
 * Fonction qui stoppe la lecture
 */                 
function stopAction() {
	player.pause();		
	player.src = "";
	curFeed = "";
	curPod = "";
	stopplaying();
}

/** 
 * Fonction qui stoppe le lecteur
 */                 
function stopplaying() {
	var viewPopupUrl = chrome.extension.getURL('popup.html');	
	var views = chrome.extension.getViews();	

	var i = 0;
	while (views[i].location.href != viewPopupUrl) { i++; }           
	var popupview = views[i];

	nowplaying = "";
	idplaying = "";
	popupview.stopplaying();
	playing = false;
	
	display();
}

/**
 * Fonction qui affiche ce qui joue 
 */                 
function display() {
	var viewPopupUrl = chrome.extension.getURL('popup.html');	
	var viewFeedsUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	
	
	console.log("FEEDS URL : " + viewFeedsUrl);

	var blntrouve = false;
	var blntrouvefeeds = false;
	
	for(i = 0; i < views.length; i++) {
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
		}
		if (views[i].location.href == viewFeedsUrl) {
			var feedsview = views[i];  		
			blntrouvefeeds = true;
		}
	}
	if (blntrouve) { popupview.displayPlaying(); }
	if (blntrouvefeeds) { feedsview.displayPlaying(); } 
}

/**
 * Fonction qui traite les erreurs
 */                 
function gotError() {
	playing = false;
	var viewPopupUrl = chrome.extension.getURL('popup.html');	
	var views = chrome.extension.getViews();	

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}           

	if(nowplaying != "") {
		nowplaying = "ERROR : " + player.error.code;
		if(blntrouve) { popupview.playerror(player.error.code); }    
	}
}

/**
 * Fonction lancée au chargement de l'extension
 */                 
function loadpage() {
	player = document.getElementById("idplayer");

	for(numflux = 0; numflux < feeds.length; numflux++) { majFlux(numflux); }

	player.addEventListener("ended", function() {playNext();}, true);
	player.addEventListener("error", function() {gotError();},true);
	player.addEventListener("timeupdate", updateProgress);
}

function htmlizeAmps(s){
  texte = s.replace(/\x26/g,"&amp;"); //globalreplace "&" (hex 26) with "&amp;"
  texte1 = texte.replace('&amp;amp;','&amp;');

  return texte1;

}

/**
 * Mise à jour des flux
 */                 
function majFlux(numf) {
	/*var xhr = new XMLHttpRequest();
	xhr.open("GET", feeds[numf].url, true);            
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// innerText does not let the attacker inject HTML elements.          
			response = xhr.responseXML;
			console.log(response);
			loadPodcasts(numf, response);
		}
	}                                                                               
	xhr.send();*/
	$.ajax({
		url: feeds[numf].url,
		dataType: "text",
		success: function(data) {			
			parser=new DOMParser();
			txt = htmlizeAmps(data);
  			xmlDoc=parser.parseFromString(txt,"text/xml");

			loadPodcasts(numf, xmlDoc);
		},
		error: function(jqxhr, status, err) {
			console.log(status);
		}
	});
}

/**
 * Fonction qui charge les podcasts pour chaque feed
 */                 
function loadPodcasts(num, xml) {
	var items = xml.getElementsByTagName("item");

	//console.log(feeds + ' ' + num + ' resp : ' + xml);
	if(xml.getElementsByTagName('image')[0].getElementsByTagName('url').length > 0) {
		feeds[num].img = xml.getElementsByTagName('image')[0].getElementsByTagName('url')[0].childNodes[0].nodeValue;        
	} else {
		if(xml.getElementsByTagName('image').length > 0) {
			feeds[num].img = xml.getElementsByTagName('image')[0].getAttribute("href");
		} else {
			feeds[num].img = "";
		}
	}

	feeds[num].title = xml.getElementsByTagName('title')[0].childNodes[0].nodeValue;
	feeds[num].subtitle = xml.getElementsByTagName('description')[0].childNodes[0].nodeValue;
	feeds[num].link = xml.getElementsByTagName('link')[0].childNodes[0].nodeValue;

	var podcasts = new Array();
	for(i = 0; i < items.length; i++) {
		var podcast = {};

		if(items[i].getElementsByTagName('guid').length > 0)
			podcast.guid = items[i].getElementsByTagName('guid')[0].childNodes[0].nodeValue;
		
		if(items[i].getElementsByTagName('title').length > 0)
			podcast.title = items[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
			
		if(items[i].getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd','subtitle').length > 0)
			podcast.subtitle = items[i].getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd','subtitle')[0].childNodes[0].nodeValue;		

		if(items[i].getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd','duration').length > 0)
			podcast.duration = items[i].getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd','duration')[0].childNodes[0].nodeValue;
		
		if(items[i].getElementsByTagName('enclosure').length > 0) {
			podcast.url = items[i].getElementsByTagName('enclosure')[0].getAttribute("url");
			podcasts.push(podcast);
		}
	}

	feeds[num].podcasts = podcasts;

	saveFeeds();

	var viewPopupUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		//console.log("View : " + views[i].location.href);
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}

	if(blntrouve) { console.log("ok"); popupview.location.reload(true); } else { console.log("ko");}       
}

function updateProgress() {
	var viewPopupUrl = chrome.extension.getURL('feeds.html');	
	var views = chrome.extension.getViews();	

	curTime = player.currentTime;
	curDuration = player.duration;

	var blntrouve = false;
	for(i = 0; i < views.length; i++) {
		if (views[i].location.href == viewPopupUrl) {
			var popupview = views[i];  		
			blntrouve = true;
			break;
		}
	}         

	if (blntrouve) {
		popupview.updateProgress();
	}
}

function setTime(ti) {
	player.currentTime = ti;
	updateProgress();
}

window.addEventListener("load", loadpage);