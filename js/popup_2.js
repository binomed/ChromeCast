// Popup_2.js

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

/*jQuery('#volumebar').click(function(event) {
	bg.setVolume(event.offsetX/150);
	setVolume();
});

function setVolume() {
	$("volumelevel").style.width = bg.getVolume()*100 + "%";
	$('volumeText').innerText = Math.round(bg.getVolume()*100) + " %";
}

*/
window.addEventListener("load", displayPlaying);

$("#feedsButton").on("click", function(event) {ouvreFeeds();})
$("#playbtn").on("click", togglePlay);

function displayPlaying() {
	var curFeed = bg.getCurFeed();
	var curPod = bg.getCurPod();
	var isPlaying = bg.isPlaying();

	if(curFeed!=undefined) {
		$("#title-playing").html(feeds[curFeed].podcasts[curPod].title);
		$("#subtitle-playing").html(feeds[curFeed].podcasts[curPod].subtitle);
		$("#podcast-cover").css("background", "url('" + feeds[curFeed].img + "')");
		$("#podcast-cover").css("background-size", "cover");
		$("#podcast-cover").css("background-position", "center center");
		
		updateProgress();

		$("#playing").removeClass("playing");
		if(isPlaying) {
			$('#playbtn').addClass("playing");	
		}
	}
}

function updateProgress() {
	var curTime = bg.getCurTime();
	var curDuration = bg.getCurDuration();

	var textPlayed = formatSeconds(Math.round(Math.round(curTime)/60)) + ":" + formatSeconds(Math.round(curTime)%60);
	var textDuration = formatSeconds(Math.round(Math.round(curDuration)/60)) + ":" + formatSeconds(Math.round(curDuration)%60);

	$("#time-play").html(textPlayed + " / " + textDuration);
}

function formatSeconds(txt) {
	if(txt < 10) 
		return "0"+txt;
	else
		return txt;
}

function togglePlay() {
	// $('#playbtn').css("background-position-y", "50px");
	if(bg.getCurFeed()!=undefined) {
		$('#playbtn').toggleClass("playing");
		bg.togglePlay();
	}
}
/*document.getElementById("buttonPrev").addEventListener("click",prevPodcast);
document.getElementById("buttonPlay").addEventListener("click",togglePlayPause);
document.getElementById("buttonStop").addEventListener("click",stopAction);
document.getElementById("buttonNext").addEventListener("click",nextPodcast);*/

