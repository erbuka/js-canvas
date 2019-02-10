window.addEventListener("load", function() {
	// initialization here

	var S_LOADING = 0;
	var S_PLAYING = 1;

	var T_LOADING = "LOADING"

	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext('2d');
	var status = S_LOADING;

	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	var song, sun;
	var progress = 0;

	canvas.width = canvas.height = 512;

	var loop = function() {
		if(status == S_PLAYING) {
			sun.draw();
		}

		if(status == S_LOADING) {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			var measure = ctx.measureText(T_LOADING);


			ctx.font = "18px Verdana";
			ctx.lineWidth = 5;

			ctx.save();
			ctx.translate(2,2);
				ctx.strokeStyle = ctx.fillStyle = "rgba(255, 192, 0, .25)";

				ctx.fillText(T_LOADING, (canvas.width - measure.width) / 2, (canvas.height + 9) / 2);

				ctx.beginPath();
				ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, Math.PI * 2);
				ctx.stroke();
			ctx.restore();

			ctx.fillStyle = ctx.strokeStyle = "rgba(255, 192, 0, 1)";

			ctx.fillText(T_LOADING, (canvas.width - measure.width) / 2, (canvas.height + 9) / 2);

			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, progress * Math.PI * 2);
			ctx.stroke();

		}

		requestAnimationFrame(loop, canvas);
	}

	MP3Song.load(
		"data/got.mp3", 
		function(song) {
			sun = new Sun(canvas, ctx, song);
			song.play();
			status = S_PLAYING;
		},
		function(p) {
			progress = p;
		}
	);

	loop();


});