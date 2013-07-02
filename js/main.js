

 var video = document.getElementsByTagName('video')[0];

video.addEventListener('loadeddata', function(e) { // Repeat this for other events
	var preloader = document.getElementById("preloader");
    preloader.parentNode.removeChild(preloader);

});

var playButton = document.getElementById("play-button");

playButton.addEventListener("click", function() {
    video.play();  
    playButton.parentNode.removeChild(playButton);
});


