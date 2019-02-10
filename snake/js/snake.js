define("snake");

var T_TITLE1 = "SNAKE";
var T_TITLE2 = "CLASSIC";
var T_PRESSENTER = "Press ENTER to start";
var T_GAMEOVER = "GAME OVER";
var T_LIVES = " LIVES";
var T_HIGHSCORE = "HIGHSCORE: ";

var S_SPLASH = 0;
var S_PLAYING = 1;
var S_LOADING = 2;
var S_DEAD = 3;
var S_NEXT_LEVEL = 4;
var S_GAMEOVER = 5;

var G_EMPTY = 0;
var G_SNAKE = 1;
var G_FRUIT = 2;
var G_WALL = 10;

var START_SPEED = 15;
var MAX_SPEED = 5;
var SPEED_INC_FRUIT = 3;

var FRUIT_BASE = 5;
var FRUIT_INC_PER_LEVEL = 1;

var SCORE_INC_PER_FRUIT = 10;

var MAX_LIVES = 3;

var DIRECTIONS = {
	TOP : new Vector2D(0, -1),
	BOTTOM : new Vector2D(0, 1),
	LEFT : new Vector2D(-1, 0),
	RIGHT : new Vector2D(1, 0),
	STILL : new Vector2D(0, 0)
}

DIRECTIONS[38] = DIRECTIONS.TOP;
DIRECTIONS.TOP.keyCode = 38;
DIRECTIONS.TOP.opposite = DIRECTIONS.BOTTOM;

DIRECTIONS[40] = DIRECTIONS.BOTTOM;
DIRECTIONS.BOTTOM.keyCode = 40;
DIRECTIONS.BOTTOM.opposite = DIRECTIONS.TOP;

DIRECTIONS[37] = DIRECTIONS.LEFT;
DIRECTIONS.LEFT.keyCode = 37;
DIRECTIONS.LEFT.opposite = DIRECTIONS.RIGHT;

DIRECTIONS[39] = DIRECTIONS.RIGHT;
DIRECTIONS.RIGHT.keyCode = 39;
DIRECTIONS.RIGHT.opposite = DIRECTIONS.LEFT;


var Grid = {
	COLORS : {
		0 : "#111",
		1 : "#999",
		2 : "#333",
		10 : "#fff"
	},
	elements: [],
	size: null,
	loadLevel : function(level) {
		this.elements.clear();
		this.size = level.size;
		for(var x = 0; x < level.size; x++) {
			for(var y = 0; y < level.size; y++) {
				this.setValueAtXY(x, y, level.get(x, y));
			}
		}
	},
	setValueAtXY : function(x, y, val) {
		this.elements[x * this.size + y] = val;
	},
	setValueAt : function(v, val) {
		this.elements[v.x * this.size + v.y] = val;
	},
	getValueAt : function(v) {
		return this.elements[v.x * this.size + v.y];
	},
	getValueAtXY : function(x, y) {
		return this.elements[x * this.size + y];
	},
	generateFruit : function() {
		this.elements[this.randomFreeSpot()] = G_FRUIT;
	},
	randomFreeSpot : function() {
		var bound = this.size * this.size;
		var r = Math.randInt(0, bound - 1);
		while(this.elements[r % bound] != G_EMPTY) {
			r++;
		}
		return r % bound;
	},
	randomFreeSpotVector : function() {
		var r = this.randomFreeSpot();
		return new Vector2D
		(
			Math.floor(r / this.size),
			r % this.size
		)
	}	
};

var Snake = {
	head : null,
	body : null,
	direction : null,
	body : null,
	extendNext : null,
	eatenFruit : 0,
	_temp1 : new Vector2D(),
	_temp2 : new Vector2D(),
	init : function() {
		this.head = Grid.randomFreeSpotVector();
		this.body = [];
		this.direction = DIRECTIONS.STILL;
		this.extendNext = false;
		this.eatenFruit = 0;

		this.body.push(this.head);

		Grid.setValueAt(this.head, G_SNAKE);
	},
	move : function() {
		if(this.direction == DIRECTIONS.STILL)
			return;

		var bd = this.body;
		var dest = this._temp1.set(this.head).setAdd(this.direction);

		if(dest.x < 0) dest.x += Grid.size;
		if(dest.y < 0) dest.y += Grid.size;

		dest.x = dest.x % Grid.size;
		dest.y = dest.y % Grid.size;

		var value = Grid.getValueAt(dest);

		if(value == G_FRUIT) {
			this.extend();
			this.eatenFruit++;
			Game.score += SCORE_INC_PER_FRUIT;
		} else if(value == G_WALL || value == G_SNAKE) {
			Game.die();
			return;
		}

		Grid.setValueAt(dest, G_SNAKE);

		if(this.extendNext) {
			bd.push(new Vector2D());
		} else {
			Grid.setValueAt(bd[bd.length - 1], G_EMPTY);
		}

		for(var i = bd.length - 2; i >= 0; i--) {
			bd[i + 1].set(bd[i]);
		}

		if(this.extendNext) {
			Grid.generateFruit();
			this.extendNext = false;
		}

		this.head.set(dest);
	},
	extend : function() {
		this.extendNext = true;
	}
};


var Game = {
	canvas: null,
	ctx: null,

	gamestate: null,
	
	size: null,
	tileSize: null,
	grid: null,
	speed: null,
	speedCheckFrame: null,
	nextDirection : null,
	
	lives : null,

	levels : null,
	currentLevel: null,
	score : null,
	highScore : 0,
	
	frameCounter : null,
	globalFrameCounter : 0,

	_temp1 : new Vector2D(),
	init: function() {
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.gamestate = S_LOADING;

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		document.body.appendChild(this.canvas);

		window.addEventListener("keydown", function(evt) {
			Game.keyDown(evt);
		});

		this.loop();

		$.ajax({
			url: "levels.json",
			type: "get",
			dataType: "json"
		}).done(function(data) {
			Game.levels = Class.deserialize(data);
			Game.gamestate = S_SPLASH;
		})

	},
	keyDown : function(evt) {
		if(this.gamestate == S_PLAYING) {
			var dir = DIRECTIONS[evt.keyCode];

			if(dir && Snake.direction != dir.opposite) {
				this.nextDirection = dir;
			}
		} else if(this.gamestate == S_SPLASH) {
			if(evt.keyCode == 13) {
				this.newGame();
			}
		}
	},
	loadLevel : function(index) {
		var lvl = this.levels[index % this.levels.length];

		Grid.loadLevel(lvl);
		Snake.init(0, 0);
		Grid.generateFruit();

		this.nextDirection = null;
		this.gamestate = S_PLAYING;
		this.speedCheckFrame = 1;
		this.speed = START_SPEED; 

		this.tileSize = Math.floor(window.innerHeight / Grid.size);
		this.size = this.tileSize * Grid.size;

	},
	die : function() {
		this.lives--;
		this.gamestate = this.lives >= 0 ? S_DEAD : S_GAMEOVER;
		this.frameCounter = 120;		

		if(this.gamestate == S_GAMEOVER) {
			this.highScore = Math.max(this.score, this.highScore);
		}
	},
	nextLevel : function() {
		this.currentLevel++;
		this.gamestate = S_NEXT_LEVEL;
		this.frameCounter = 120;
	},
	newGame: function() {
		this.currentLevel = -1;
		this.lives = MAX_LIVES;
		this.score = 0;
		this.nextLevel();
	},
	update: function() {
		this.globalFrameCounter = (this.globalFrameCounter + 1) % 1024;
		if(this.gamestate == S_PLAYING) {
			if(this.speedCheckFrame++ % this.speed == 0) {
				this.speedCheckFrame = 1;

				var dest = this._temp1.set(Snake.head).setAdd(Snake.direction);

				if(this.nextDirection) {
					Snake.direction = this.nextDirection;
				}

				// move the snake
				Snake.move();

				if(Snake.eatenFruit == (FRUIT_BASE + this.currentLevel * FRUIT_INC_PER_LEVEL)) {
					this.nextLevel();
				}

				this.speed = Math.max(MAX_SPEED, START_SPEED - Math.floor(Snake.eatenFruit / SPEED_INC_FRUIT));

			}
		} else if(this.gamestate == S_NEXT_LEVEL || this.gamestate == S_DEAD) {
			if(this.frameCounter -- <= 0) {
				this.loadLevel(this.currentLevel);
			}
		} else if(this.gamestate == S_GAMEOVER) {
			if(this.frameCounter -- <= 0) {
				this.gamestate = S_SPLASH;
			}
		}
	},
	renderLevel : function(ctx) {
		var ts = this.tileSize;
		ctx.translate(
			Math.floor((this.canvas.width - this.size) / 2), 
			Math.floor((this.canvas.height - this.size) / 2)
		);


		for(var x = 0; x < Grid.size; x++) {
			for(var y = 0; y < Grid.size; y++) {
				var value = Grid.getValueAtXY(x, y);
				ctx.fillStyle = Grid.COLORS[value];
				ctx.fillRect(x * ts, y * ts, ts, ts);
			}
		}
	},
	render : function() {
		var ctx = this.ctx;
		var canvas = this.canvas

		ctx.save();

		if(this.gamestate == S_PLAYING) {


			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// render score
			var fs = Math.floor(canvas.height / 14);
			var text = this.score + "";

			ctx.fillStyle = "#fff";
			ctx.font = fs + "px silkscreen";
			ctx.fillText(text, fs / 2, fs);

			// render grid
			this.renderLevel(ctx);



		} else if(this.gamestate == S_SPLASH) {

			var fsTitle1 = Math.floor(canvas.height / 6);
			var fsTitle2 = Math.floor(canvas.height / 6);
			var fsHightScore = Math.floor(canvas.height / 14);


			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);	

			ctx.fillStyle = "#fff";

			ctx.font = fsTitle1 + "px silkscreen";
			ctx.fillText(T_TITLE1, (canvas.width - ctx.measureText(T_TITLE1).width) / 2, canvas.height / 4);

			ctx.font = fsTitle2 + "px silkscreen";
			ctx.fillText(T_TITLE2, (canvas.width - ctx.measureText(T_TITLE2).width) / 2, canvas.height / 4 + fsTitle1);

			ctx.font = fsHightScore + "px silkscreen";
			ctx.fillText(T_HIGHSCORE + this.highScore, (canvas.width - ctx.measureText(T_HIGHSCORE + this.highScore).width) / 2, canvas.height / 4 * 3);


			if(this.globalFrameCounter % 32 < 15) {
				var fsPressEnter = Math.floor(canvas.height / 14);

				ctx.font = fsPressEnter + "px silkscreen";
				ctx.fillText(T_PRESSENTER, (canvas.width - ctx.measureText(T_PRESSENTER).width) / 2, canvas.height / 6 * 5);

			}

		} else if(this.gamestate == S_NEXT_LEVEL || this.gamestate == S_DEAD || this.gamestate == S_GAMEOVER) {

			var text = "";
			var fs = Math.floor(canvas.height / 6);

			switch(this.gamestate) {
				case S_NEXT_LEVEL:
				case S_DEAD:
					text = "LEVEL " + (this.currentLevel + 1);
					break;
				case S_GAMEOVER:
					text = T_GAMEOVER;
					break;
				default:
					break;
			}
			
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#fff";
			ctx.font = fs + "px silkscreen";
			ctx.fillText(text, (canvas.width - ctx.measureText(text).width) / 2, (canvas.height) / 2);

			if(this.gamestate == S_DEAD || this.gamestate == S_NEXT_LEVEL) {
				fs = Math.floor(canvas.height / 14);
				text = this.lives + T_LIVES;

				ctx.font = fs + "px silkscreen";
				ctx.fillText(text, (canvas.width - ctx.measureText(text).width) / 2, canvas.height / 6 * 5);
			}
	
		}

		ctx.restore();
	},
	loop: function() {
		this.update();
		this.render();
		window.requestAnimationFrame(Game.loop.bind(this), this.canvas);
	}
}

window.addEventListener("load", function() {
	Game.init();
});