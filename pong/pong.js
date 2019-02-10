
var PRESS_ENTER = "Press SPACE to start!"

var GAME_STATES = {
	BEGIN: 1,
	PLAYING: 2
}

var UP_ARROW = 38, DOWN_ARROW = 40;

var ball, field, player, ai, keystate, gamestate, sound, textWidth;

gamestate = GAME_STATES.BEGIN;

player = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	speed: 10,
	score: 0,
	init: function() {
		this.x = 10;
		this.y = (field.height - this.height) / 2.0;
	},
	update: function() {
		if(keystate[UP_ARROW]) this.y -= this.speed;
		if(keystate[DOWN_ARROW]) this.y += this.speed;

		if(this.y < 0) this.y = 0;
		else if(this.y + this.height > field.height)
			this.y = field.height - this.height;

	},
	render: function() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
};

ai = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	speed: 10,
	score: 0,
	init: function() {
		this.x = field.width - this.width - 10;
		this.y = (field.height - this.height) / 2.0;
	},
	update: function() {
		if(ball.y + ball.size / 2 < this.y)
			this.y -= this.speed;
		else if(ball.y + ball.size / 2 > this.y + this.height)
			this.y += this.speed;

		if(this.y < 0)
			this.y = 0;
		else if(this.y > field.height - this.height)
			this.y = field.height - this.height;


	},
	render: function() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}


ball = {
	x: null,
	y: null,
	vx: null,
	vy: null,
	size: 20.0,
	speed: 20, 
	init: function() {
		this.x = (field.width - this.size) / 2.0;
		this.y = (field.height - this.size) / 2.0;
		this.vx = this.vy = 0;
	},
	throwBall: function() {
		var angle = (Math.random() * 2 - 1) * Math.PI / 16;
		var dir = Math.random() > 0.5 ? 1 : -1;
		this.vx = this.speed * Math.cos(angle) * dir;
		this.vy = this.speed * Math.sin(angle);

	},
	intersects: function(pad) {
		return this.x < pad.x + pad.width && this.y < pad.y + pad.height
			&& pad.x < this.x + this.size && pad.y < this.y + this.size;
	},
	update: function() {
		this.x += this.vx;
		this.y += this.vy;

		if(this.y < 0) {
			this.y = 0;
			this.vy *= -1;
		}

		if(this.y > field.height - this.size) {
			this.y = field.height - this.size;
			this.vy *= -1;
		}

		if(this.x < 0) {
			ai.score += 1;

			player.init();
			ai.init();
			this.init();
			
			gamestate = GAME_STATES.BEGIN;
		}

		if(this.x + this.size > field.width) {
			player.score += 1;
			
			player.init();
			ai.init();
			this.init();
			
			gamestate = GAME_STATES.BEGIN;
		}

		var pad = this.vx < 0 ? player : ai;

		if(this.intersects(pad)) {
			this.vx *= -1;
			var delta = ((this.y - pad.y) / pad.height) * 2.0 - 1.0;
			var phi = 0.25 * Math.PI * delta;
			var sign = this.vx < 0 ? -1 : 1;

			this.vx = sign * Math.cos(phi) * this.speed;
			this.vy = Math.sin(phi) * this.speed;

			sound.play();
		}


	},
	render: function() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x, this.y, this.size, this.size);
	}
}

field = {
	width: 1000.0,
	height: 750.0,
	render: function() {
		// background
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, this.width, this.height);
		

		// border
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 6;
		ctx.strokeRect(0, 0, this.width, this.height);

		// net
		var w = 6;
		var x = (this.width - w) / 2.0;
		var step = this.height / 21.0;
		ctx.fillStyle = "#fff";

		for(var i = 0; i <= this.height;) {
			ctx.fillRect(x, i, w, step)
			i += 2 * step;
		}

	}
}	

keystate = {};

window.addEventListener("keydown", function(evt) {
	keystate[evt.keyCode] = true;
	if(keystate[32] && gamestate != GAME_STATES.PLAYING) {
		gamestate = GAME_STATES.PLAYING;
		ball.throwBall();
	}
});
window.addEventListener("keyup", function(evt) {
	keystate[evt.keyCode] = false;
});

mainLoop = function() {
	player.update();
	ai.update();
	ball.update();

	field.render();
	ball.render();
	player.render();
	ai.render();

	if(gamestate == GAME_STATES.BEGIN) {

		ctx.fillStyle = "#000";
		ctx.fillRect((field.width - textWidth) / 2.0 -  50, 100, textWidth + 100, 140);

		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 6;
		ctx.strokeRect((field.width - textWidth) / 2.0 -  50, 100, textWidth + 100, 140);

		ctx.fillStyle = "#fff";
		ctx.fillText(PRESS_ENTER, (field.width - textWidth) / 2.0, 180);

		ctx.fillText(player.score + "", field.width / 2 - ctx.measureText(player.score + "").width - 50, field.height / 2 - 20);
		ctx.fillText(ai.score + "", field.width / 2 + 50, field.height / 2 - 20);
	}


	window.requestAnimationFrame(mainLoop);
};

window.addEventListener("load", function() {

	var wrapper = document.getElementById("wrapper");

	sound = document.createElement("audio");
	sound.src = "pong.wav";

	canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	wrapper.style.width = window.innerWidth + "px";
	wrapper.style.height = window.innerHeight + "px";

	wrapper.appendChild(canvas);

	ctx = canvas.getContext('2d');

	ctx.scale(canvas.width / field.width, canvas.height / field.height);
	ctx.font = "40px Courier New";

	textWidth = ctx.measureText(PRESS_ENTER).width;

	ball.init();
	player.init();
	ai.init();

	mainLoop();
});

