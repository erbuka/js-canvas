window.addEventListener("load", function () {
	// initialization here

	var S_LOADING = 0;
	var S_PLAYING = 1;
	var S_READY = 2;

	var T_LOADING = "LOADING";
	var T_CLICK_TO_PLAY = "Click to PLAY";

	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext('2d');
	var status = S_LOADING;

	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	var song, sun;
	var progress = 0;

	canvas.width = canvas.height = 512;

	ctx.font = "18px Verdana";
	ctx.lineWidth = 5;

	window.addEventListener("click", function () {
		if (status === S_READY) {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);			
			status = S_PLAYING;
			song.play();
		}
	});

	var drawCenteredText = function (text) {

		var measure = ctx.measureText(text);

		ctx.save();
		{
			ctx.translate(2, 2);
			ctx.strokeStyle = ctx.fillStyle = "rgba(255, 192, 0, .25)";
			ctx.fillText(text, (canvas.width - measure.width) / 2, (canvas.height + 9) / 2);
		}
		ctx.restore();

		ctx.fillStyle = ctx.strokeStyle = "rgba(255, 192, 0, 1)";
		ctx.fillText(text, (canvas.width - measure.width) / 2, (canvas.height + 9) / 2);
	}

	var drawProgress = function () {
		ctx.save();
		{
			ctx.translate(2, 2);
			ctx.strokeStyle = ctx.fillStyle = "rgba(255, 192, 0, .25)";

			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();


		ctx.fillStyle = ctx.strokeStyle = "rgba(255, 192, 0, 1)";

		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, progress * Math.PI * 2);
		ctx.stroke();		

	}

	var loop = function () {
		if (status === S_PLAYING) {
			sun.draw();
		}

		if (status === S_READY || status == S_LOADING) {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			drawProgress();
			drawCenteredText(status === S_READY ? T_CLICK_TO_PLAY : T_LOADING);
		}

		if (status === S_LOADING) {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			drawProgress();
			drawCenteredText(T_LOADING);

		}

		requestAnimationFrame(loop, canvas);
	}

	MP3Song.load(
		"data/got.mp3",
		function (sn) {
			sun = new Sun(canvas, ctx, sn);
			song = sn;
			status = S_READY;
		},
		function (p) {
			progress = p;
		}
	);

	loop();


});