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

// $('#addfeedlabel')[0].innerHTML = chrome.i18n.getMessage("addFeed");
$('#listlabel')[0].innerHTML 	= chrome.i18n.getMessage("podcastList");
$("#feedurllabel")[0].innerHTML = chrome.i18n.getMessage("feedURL");

function showPopup() { $('#addFeedBox').fadeIn('slow'); }
function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(s); }
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


function affichePods() {
	feeds = bg.getFeeds();
	// console.log(feeds);

	for(numFeed = 0; numFeed < feeds.length; numFeed++) {

		/** AJOUT DU FEED DANS LA SIDEBAR **/
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

	if(isPlaying) {
		affichePodcasts(curFeed);
	}
}	

function affichePodcastsEvent(event) { 
	affichePodcasts(event.data.numFeed);
}

function affichePodcasts(numFeed) {
	$("#table-podcasts tbody").html("");
	displayedFeed = numFeed;

	$(".sidebar-feed-txt").removeClass('selected-feed');
	$(".sidebar-feed:nth-of-type("+(numFeed+1)+") .sidebar-feed-txt").addClass('selected-feed');

	/** AJOUT DES PODCASTS **/
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

	displayPlaying();
}

function playPodcastEvent(event) {
	console.log("Feed : " + event.data.numFeed);
	console.log("Podcast : " + event.data.numPod);

	bg.togglePlayPodcast(event.data.numFeed, event.data.numPod);
}

function dwlPodcastEvent(event) {
	window.open(feeds[event.data.numFeed].podcasts[event.data.numPod].url);
}

function displayPlaying() {
	var curFeed = bg.getCurFeed();
	var curPod = bg.getCurPod();
	var isPlaying = bg.isPlaying();
	
	$(".podcast-playing").removeClass("podcast-playing");	

	if(displayedFeed == curFeed) {
		if(bg.isPlaying())
			$("#table-podcasts tbody tr:nth-of-type("+(curPod+1)+") .table-podcasts-actions-ply").addClass("podcast-playing");
	} 
}