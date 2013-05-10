// Feeds_2.js

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

window.addEventListener("load", affichePods);

var displayedFeed = "";

$("#addfeedlabel").on("click", function() { showPopup(); });
$("#closeURL").on("click", function() { $('#addFeedBox').fadeOut('slow'); });
$("#validURL").on("click", function() { addRSS(); });

$('#listlabel')[0].innerHTML 	= chrome.i18n.getMessage("podcastList");
$("#feedurllabel")[0].innerHTML = chrome.i18n.getMessage("feedURL");

function showPopup() { $('#addFeedBox').fadeIn('slow'); }

function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(s); }

/**
 * Ajout d'un nouveau flux RSS
 */
function addRSS() {
	var feed = $('#idUrlPodcast')[0].value;

	// Si un feed est renseigné
	if(feed != "") {
		// On vérifie qu'on a bien une URL
		if(isUrl(feed)) {                        
			bg.addFeed(feed);                   
		} else {
			alert("Mauvais format URL");
		}
	} }

/**
 * Affichage des flux dans la sidebar et ajout des eventHandlers
 */
function affichePods() {
	feeds = bg.getFeeds();

	// On affiche la liste des flux dans la sidebar
	for(numFeed = 0; numFeed < feeds.length; numFeed++) {

		var divSidebarFeed = $("<div />", {'class':'sidebar-feed'});

		var divSidebarFeedImg = $("<div />", {'class':'sidebar-feed-img'});
		var divSidebarFeedImgCt = $("<img />", {'src':feeds[numFeed].img});
		divSidebarFeedImgCt.appendTo(divSidebarFeedImg);

		var divSidebarFeedTxt = $("<div />", {'class':'sidebar-feed-txt'});
		divSidebarFeedTxt.html(feeds[numFeed].title);
		divSidebarFeedTxt.on('click', { numFeed: numFeed }, affichePodcastsEvent);

		divSidebarFeedImg.appendTo(divSidebarFeed);
		divSidebarFeedTxt.appendTo(divSidebarFeed);

		divSidebarFeed.appendTo("#sidebar");
	}

	var curFeed = bg.getCurFeed();
	var isPlaying = bg.isPlaying();

	// Si un podcast est en cours de lecture ou sélectionné, on l'affiche
	if(curFeed != undefined) {
		affichePodcasts(curFeed);
	}

	// Ajout des hotkeys du clavier
	$('body').keyup(function(e){
	   if(e.keyCode == 32){
	       // user has pressed space
	       bg.togglePlay();
	   }
	   if(e.keyCode == 	75){
	       bg.playNext(); // k
	   }
	   if(e.keyCode == 	74){
	   		// k
	       bg.playPrevious();
	   }
	});

	// Ajout des eventHandlers sur les boutons du player
	$("#player-rew").on("click", function(){ bg.playPrevious();});
	$("#player-play").on("click", function(){ bg.togglePlay();});
	$("#player-for").on("click", function(){ bg.playNext();});
}	

/**
 * Affichage de la liste des podcasts lors du chargement de la page
 */
function affichePodcastsEvent(event) { 
	affichePodcasts(event.data.numFeed);
}

/**
 * Affichage de la liste des podcasts d'un flux
 */
function affichePodcasts(numFeed) {
	// On vide l'affichage
	$("#table-podcasts tbody").html("");
	displayedFeed = numFeed;

	// Dans la sidebar, on met en gras le flux sélectionné
	$(".sidebar-feed-txt").removeClass('selected-feed');
	$(".sidebar-feed:nth-of-type("+(numFeed+1)+") .sidebar-feed-txt").addClass('selected-feed');

	// On ajoute les podcasts du flux
	for(i = 0; i < feeds[numFeed].podcasts.length; i++) {
		var trPod = $("<tr />");

		var tdName = $("<td />", {"class":'table-podcasts-name'});
		var pTitle = $("<p />", {'class':'table-podcasts-name-title'});
		var pSubtitle = $("<p />");
		
		pTitle.html(feeds[numFeed].podcasts[i].title);	
		pSubtitle.html(feeds[numFeed].podcasts[i].subtitle);

		pTitle.appendTo(tdName);
		pSubtitle.appendTo(tdName);

		tdName.appendTo(trPod);

		var tdDuration = $("<td />");
		tdDuration.html(feeds[numFeed].podcasts[i].duration);

		tdDuration.appendTo(trPod);

		var tdActions = $("<td />");
		
		var divDownload = $('<div />', {'class':'table-podcasts-actions-dwl'});
		divDownload.html("&nbsp;");
		divDownload.on('click', { numFeed: numFeed, numPod: i }, dwlPodcastEvent);

		var divPlay = $('<div />', {'class':'table-podcasts-actions-ply'});
		divPlay.html("&nbsp;");
		divPlay.on('click', { numFeed: numFeed, numPod: i }, playPodcastEvent);

		divDownload.appendTo(tdActions);
		divPlay.appendTo(tdActions);
		tdActions.appendTo(trPod);

		trPod.appendTo("#table-podcasts tbody");
	}

	// On affiche le podcast en cours de lecture le cas échéant
	displayPlaying();
}

/**
 * Lancement de la lecture d'un podcast
 */
function playPodcastEvent(event) {
	bg.togglePlayPodcast(event.data.numFeed, event.data.numPod);
}

/**
 * Lancement du téléchargement d'un podcast
 */
function dwlPodcastEvent(event) {
	window.open(feeds[event.data.numFeed].podcasts[event.data.numPod].url);
}

/**
 * Affichage du podcast en cours de lecture
 */
function displayPlaying() {
	var curFeed = bg.getCurFeed();
	var curPod = bg.getCurPod();
	var isPlaying = bg.isPlaying();
	
	$(".podcast-playing").removeClass("podcast-playing");	// On retire la classe de lecture à l'ensemble des pods

	// Si le feed affiché est celui en cours de lecture, on pourra donner au podcast en cours
	// le classe adéquate
	if(displayedFeed == curFeed) {
		if(bg.isPlaying())
			$("#table-podcasts tbody tr:nth-of-type("+(curPod+1)+") .table-podcasts-actions-ply").addClass("podcast-playing");
	} 

	// Si un podcast est sélectionné pour lecture
	if(curFeed != undefined) {
		$("#title-playing").html(feeds[curFeed].podcasts[curPod].title);
		$("#subtitle-playing").html(feeds[curFeed].podcasts[curPod].subtitle);

		$("#player-cover").css("background", "url('" + feeds[curFeed].img + "')");
		$("#player-cover").css("background-size", "cover");
		$("#player-cover").css("background-position", "center center");

		updateProgress();
	}

	// Si la lecture est en cours, on affiche le bouton "pause", sinon on affiche le bouton "play"
	if(isPlaying) {
		$("#player-play").addClass("player-play-playing");
	} else {
		$("#player-play").removeClass("player-play-playing");
	}
}

/**
 * Mise à jour de la progression de lecture 
 */
function updateProgress() {
	var curTime = bg.getCurTime();
	var curDuration = bg.getCurDuration();
	var progress = curTime / curDuration;

	var textPlayed = formatSeconds(Math.floor(curTime/60)) + ":" + formatSeconds(Math.floor(curTime)%60);

	if(!isNaN(curDuration)) {
		var textDuration = formatSeconds(Math.floor(curDuration/60)) + ":" + formatSeconds(Math.floor(curDuration)%60);
	} else {
		var textDuration = "--";
	}
	

	$("#progress-text").html(textPlayed + " / " + textDuration);
	$("#progress-playing").css("width", (progress * 400) + "px");
}

/**
 * Fonction qui rajoute les 0 devant les chiffres inférieurs à 10
 */
function formatSeconds(txt) {
	if(txt < 10) 
		return "0"+txt;
	else
		return txt;
}

/**
 * Envoi de la nouvelle progression lors d'un clic sur la barre de progression
 */
function updateTime(ti) {
	var curDuration = bg.getCurDuration();
	var progress = ti / 400;

	bg.setTime(progress * curDuration);
}

// Ajout de l'eventHandler pour le clic sur la barre de progression
$('#player-title').on("click", function(event) { updateTime(event.offsetX);});