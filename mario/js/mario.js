/*
	TODO
	-Add a preload
	-Add the stage clear screens
	-Optional: Add the Mario run
	-Optional: remake the coin aniamtion
	And that's it I think
*/

resources = [
	{id : "music", type: "audio", src: "sound/music.ogg"} ,
	{id : "jump", type: "audio", src: "sound/jump.ogg"},
	{id : "stomp", type: "audio", src: "sound/stomp.ogg"},
	{id : "death", type: "audio", src: "sound/dead.ogg"},
	{id : "smash", type: "audio", src: "sound/smash.ogg"},
	{id : "coin", type: "audio", src: "sound/coin.ogg"},
	{id : "stage_clear", type: "audio", src: "sound/stage_clear.ogg"},
	{id : "title", type: "image", src: "img/title.png"},
	{id : "tiles", type: "image", src: "img/tiles.png"},
	{id : "sprites", type: "image", src: "img/sprites.png"}
];

resourceLoader = new ResourceLoader();
resourceLoader.addAll(resources);

Constants = {
	Dt: 1000.0 / 60.0,
	OffsetX: 5, 
	OffsetY: 5,
	Gravity: 0.01,
	
	MarioMaxVelocity: 5.0 / 60.0,
	MarioAcceleration: 0.005,
	MarioMinVelocity: 0.001,
	MarioJumpVelocity: 0.30,
	MarioStompVelocity: 0.15,
	MarioDeathVelocity: 0.15,
	MarioDeathGravity: 0.005,
	
	TileSize: 32,
	HalfTileSize: 16,
	VirtualHeight: 10 * 32,
	VirtualWidth: null,

	PressEnter: "Press ENTER to start",
	StageClear: "Course Clear!"
};

GameStates = {
	Splash: 0,
	Playing: 1,
	StageEnding: 2,
	Loading: 3
};

TileTypes = {
	Empty: 0,
	Solid: 1
};

CharacterStates = {
	Standing: 0,
	Running: 1,
	Jumping: 2,
	Dying: 3,
	Dead: 4
};

/* Timers */

Timers = {
	questionBlock: 0,
	init: function() {
		setInterval(function() {
			Timers.questionBlock = (Timers.questionBlock + 1) % 4;
		}, 250);
	}
}

Timers.init();

/* Images */
Images = {
	Title: resourceLoader.getResource("title")
};

/* Sound */

SoundFX = {
	Music: "music",
	Jump: "jump",
	Stomp: "stomp",
	Death: "death",
	Smash: "smash",
	Coin: "coin",
	StageClear: "stageClear"
};

Sound = new SoundEngine(8);
Sound.loadSound(SoundFX.Music, resourceLoader.getResource("music"));
Sound.loadSound(SoundFX.Jump, resourceLoader.getResource("jump")); 
Sound.loadSound(SoundFX.Stomp, resourceLoader.getResource("stomp") );
Sound.loadSound(SoundFX.Death, resourceLoader.getResource("death") );
Sound.loadSound(SoundFX.Smash, resourceLoader.getResource("smash"));
Sound.loadSound(SoundFX.Coin, resourceLoader.getResource("coin"));
Sound.loadSound(SoundFX.StageClear, resourceLoader.getResource("stage_clear"));

/* Helper functions */

Helper = {};
Helper.distance = function(x, y) { return Math.abs(x - y); }
Helper.insideInterval = function(x, a, b) { return x >= a && x <= b; },
Helper.intersectInterval = function(x1, x2, y1, y2) {
	return Helper.insideInterval(x1, y1, y2) || Helper.insideInterval(x2, y1, y2)
		|| Helper.insideInterval(y1, x1, x2) || Helper.insideInterval(y2, x1, x2);
}
Helper.intersectRect = function(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {
	return Helper.intersectInterval(ax1, ax2, bx1, bx2) && Helper.intersectInterval(ay1, ay2, by1, by2);
}

/* Listener to key press/release */
KeyState = {
	enter: function() { return this[13]; },
	left: function() { return this[37]; },
	right: function() { return this[39]; },
	up: function() { return this[38]; },
	down: function() { return this[40];},
	mousedown: function() { return this['md']; }
}

window.addEventListener("keydown", function(evt) {
	KeyState[evt.keyCode] = true;
});

window.addEventListener("keyup", function(evt) {
	delete KeyState[evt.keyCode];
});

/* Tilemaps and tiles */
TileMap = function(params) {

	if(params.tilePackedMatrix && params.width && params.height) {
		var w = this._width = params.width;
		var h = this._height = params.height;

		this._data = {};

		for(var i = 0; i < h; i++) {

			this._data[h - i - 1] = {};
			
			for(var j = 0; j < w; j++) {
				var sprite = params.tilePackedMatrix[i * w + j] != 0 ? params.tilePackedMatrix[i * w + j] : null; 
				var type = TileMap.SolidTiles.indexOf(sprite) > -1 ? TileTypes.Solid : TileTypes.Empty; 

				var tile;

				if(sprite == 20) { // Destructable block
					tile = new DestructableBlock();
				} else if(sprite == 5) {
					tile = new QuestionBlock();
				} else {
					tile = new Tile(type, sprite);
				}


				this._data[h - i - 1][j] = tile;
			}
		}
	} 
}

TileMap.SolidTiles = [1, 2, 3, 4, 5, 17, 18, 19, 20, 21, 33, 34, 49, 50];

TileMap.prototype.getWidth =  function() { return this._width;}
TileMap.prototype.getHeight = function() { return this._height;}
TileMap.prototype.getTile = function(i, j) {
	return this._data[i][j]; 
}

Tile = function(type, sprite) {
	this._type = type;
	this._sprite = null;

	if(sprite)
		this._sprite = sprite;
}
Tile.prototype.getSprite = function() { return this._sprite;}
Tile.prototype.getType = function () { return this._type; }
Tile.prototype.onHit = null;
Tile.prototype.update = null;
Tile.prototype.draw = function(ctx, x, y) {
	if(this._sprite) {
		SpriteSheet.commonTiles.draw(
			this._sprite, 
			ctx,
			Math.floor(x * Constants.TileSize), //x
			Math.floor(y * Constants.TileSize), //y
			Constants.TileSize,  // width
			Constants.TileSize // height
		);
	}
}

DestructableBlock = function() {
	Tile.call(this, TileTypes.Solid, 20);
	this._state = 0;
	this._animation = 0;
	this._maxAnimationFrame = 30; // 2 seconds animation
	this._pieces = null;
}

DestructableBlock.prototype = Object.create(Tile.prototype);
DestructableBlock.prototype.constructor = DestructableBlock;
DestructableBlock.prototype.onHit = function() {
	if(this._state == 0) {
		Sound.play(SoundFX.Smash);
		this._type = TileTypes.Empty;
		this._state = 1;

		var t2 = Constants.HalfTileSize;

		this._pieces = [
			{sx: 0,		sy: 0, 		x: 0, 		y: 0, 		vx: -20, 	vy: -20},
			{sx: t2, 	sy: 0, 		x: t2, 		y: 0, 		vx: 20, 	vy: -20},
			{sx: 0, 	sy: t2, 	x: 0, 		y: t2,	 	vx: -10, 	vy: -8},
			{sx: t2, 	sy: t2, 	x: t2, 		y: t2,	 	vx: 10, 	vy: -8}
		];
	}	
}
DestructableBlock.prototype.update = function() {
	if(this._state == 0)
		return;
	else if(this._state == 1) {
		var ps = this._pieces;
		this._animation++;

		for(var i = 0; i < ps.length; i++) {
			ps[i].vy += 2;
			ps[i].x += ps[i].vx;
			ps[i].y += ps[i].vy;
		}

		if(this._animation >= this._maxAnimationFrame)
			this._state = 2;
	}
}
DestructableBlock.prototype.draw = function(ctx, x, y) {
	if(this._state == 0)
		Tile.prototype.draw.call(this, ctx, x, y);
	else if(this._state == 1) {
		var ps = this._pieces;
		var t2 = Constants.HalfTileSize;
		for(var i = 0; i < ps.length; i++) {
			ctx.globalAlpha = (this._maxAnimationFrame - this._animation) / this._maxAnimationFrame;
			SpriteSheet.commonTiles.drawClipped(
				this._sprite,
				ctx,
				ps[i].sx,
				ps[i].sy,
				t2,
				t2,
				Math.floor(x * Constants.TileSize) + ps[i].x,
				Math.floor(y * Constants.TileSize) + ps[i].y,
				t2,
				t2
			);
			ctx.globalAlpha = 1;
		}
	}
}

QuestionBlock = function() {
	Tile.call(this, TileTypes.Solid, 5);
	this._state = 0;
	this._hitAnimation = 0;
	this._maxHitAnimationFrame = 10;
	this._block = [11, 12, 13, 14];
	this._coin = [7, 8, 9, 10];
}

QuestionBlock.prototype = Object.create(Tile.prototype);
QuestionBlock.prototype.constructor = QuestionBlock;
QuestionBlock.prototype.onHit = function() {
	if(this._state == 0) {
		Sound.play(SoundFX.Coin);
		this._sprite = 21;
		this._state = 1;
	}
}
QuestionBlock.prototype.update = function() {
	if(this._state == 1) {
		this._hitAnimation++;
		if(this._hitAnimation >= this._maxHitAnimationFrame)
			this._state = 2;
	}
}
QuestionBlock.prototype.draw = function(ctx, x, y) {
	if(this._state == 0) {
		SpriteSheet.commonSprites.draw(
			this._block[Timers.questionBlock],
			ctx,
			Math.floor(x * Constants.TileSize),
			Math.floor(y * Constants.TileSize),
			Constants.TileSize,
			Constants.TileSize
		);
	}
	else if(this._state == 1) {
		var delta0 = this._hitAnimation / this._maxHitAnimationFrame;
		var delta1 = delta0 * 2 - 1;
		var coinIndex = Math.floor(delta0 * 8) % 4;

		delta1 = delta1 < 0 ? 1 + delta1 : 1 - delta1;

		SpriteSheet.commonSprites.draw(
			this._coin[coinIndex], 
			ctx,
			Math.floor(Constants.TileSize * x), 
			Math.floor(Constants.TileSize * (y - 1 - delta1)),
			Constants.TileSize,
			Constants.TileSize
		);

		Tile.prototype.draw.call(this, ctx, x, y - delta1 / 4);
	}
	else if(this._state == 2) {
		Tile.prototype.draw.call(this, ctx, x, y);
	} 	
}


/* Sprites */
SpriteSheet = function(img, dimension) {

	if(img instanceof Image)
		this._sheet = img;
	else {
		this._sheet = new Image();
		this.src = img;
	}

	if(dimension) {
		this._dimension = dimension;

		var w = dimension.w;
		var h = dimension.h;

		var xTiles = Math.floor( dimension.imgWidth / w);
		var yTiles = Math.floor( dimension.imgHeight / h);

		for(var i = 0; i < yTiles; i++)
			for(var j = 0; j < xTiles; j++) {
				this.newSprite(i * xTiles + j + 1, j * w, i * h, w, h);
			}
	}
}
SpriteSheet.prototype.newSprite = function(id, x, y, w, h) {
	this[id] = {x : x, y: y, width: w, height: h};
}
SpriteSheet.prototype.draw = function(id, ctx, x, y, width, height) {
	var data = this[id];
	ctx.drawImage(this._sheet, data.x, data.y, data.width, data.height, x, y, width, height);
}
SpriteSheet.prototype.drawClipped = function(id, ctx, sx, sy, sw, sh, x, y, w, h) {
	var data = this[id];
	ctx.drawImage(this._sheet,
		data.x + sx,
		data.y + sy,
		sw, sh,
		x, y, w, h);
}

SpriteSheet.commonTiles = new SpriteSheet(resourceLoader.getResource("tiles"), { w : 64, h : 64, imgWidth : 1024, imgHeight: 1024 });
SpriteSheet.commonSprites = new SpriteSheet(resourceLoader.getResource("sprites"));

SpriteSheet.commonSprites.newSprite(0, 0, 0, 64, 108); // Mario standing
SpriteSheet.commonSprites.newSprite(1, 64, 0, 64, 108); // Mario runing 1
SpriteSheet.commonSprites.newSprite(2, 128, 0, 64, 108); // Mario running 2
SpriteSheet.commonSprites.newSprite(3, 192, 0, 64, 108); // Mario jumping
SpriteSheet.commonSprites.newSprite(6, 320, 0, 64, 64); // Mario dying

SpriteSheet.commonSprites.newSprite(4, 256, 0, 64, 64); // Goomba 1
SpriteSheet.commonSprites.newSprite(5, 256, 64, 64, 64); // Goomba 2

SpriteSheet.commonSprites.newSprite(7, 0, 128, 64, 64); // Coin 1
SpriteSheet.commonSprites.newSprite(8, 64, 128, 64, 64); // Coin 2
SpriteSheet.commonSprites.newSprite(9, 128, 128, 64, 64); // Coin 3
SpriteSheet.commonSprites.newSprite(10, 192, 128, 64, 64); // Coin 4

SpriteSheet.commonSprites.newSprite(11, 0, 192, 64, 64); // Question Block 1
SpriteSheet.commonSprites.newSprite(12, 64, 192, 64, 64); // Question Block 2
SpriteSheet.commonSprites.newSprite(13, 128, 192, 64, 64); // Question Block 3
SpriteSheet.commonSprites.newSprite(14, 192, 192, 64, 64); // Question Block 4

/* Background */

ParallaxBackground = function(srcImage, parallaxIntensity, repeatOffset) {
	this._intensity = parallaxIntensity;

	this._image = new Image();

	this._image.src = srcImage;
	this._image.height = 320;
	this._image.width = 1000;

	this._offset = 0;

	if(repeatOffset)
		this._offset = Math.floor(repeatOffset * Constants.TileSize);
}

ParallaxBackground.prototype.draw = function(ctx, canvas, offsetX, offsetY) {

	var ox = Math.floor((offsetX * this._intensity) * Constants.TileSize);
	var oy = Math.floor((offsetY * this._intensity) * Constants.TileSize);
	var img = this._image;

	var startX = ox - Math.floor(ox / (img.width + this._offset)) * (img.width + this._offset);


	if(startX <= img.width)
		ctx.drawImage(img, startX, 0, img.width - startX, img.height, 0, Constants.VirtualHeight - img.height + oy, img.width - startX, img.height);

	var x = img.width - startX + this._offset;

	while(x < canvas.width) {
		ctx.drawImage(img, 0, 0, img.width, img.height, x, Constants.VirtualHeight - img.height + oy, img.width, img.height);
		x += img.width + this._offset;
	}

}

/* Generic moving character */
Character = function(tileMap, x, y) {
	this._x = x;
	this._y = y;
	this._width = 1;
	this._height = 2;
	this._tileMap = tileMap;
	this._jumping = false;
	this._velocity = { 
		x: 0,
		y: 0
	}
	this._state = 0;
	this._inputEnabled = true;
}

Character.prototype.update = function() {
	var map = this._tileMap;

	if(this._x < 0) {
		this._x = 0;
		this.onCollisionLeft();
	}

	if(this._x > this._tileMap.getWidth() - 1) {
		this._x = this._tileMap.getWidth() - 1;
		this.onCollisionRight();
	}

	var xLeft = Math.floor(this._x - this._width / 10);
	var xRight = Math.floor(this._x + this._width * 11 / 10);
	var xTopBottomLeft = Math.floor(this._x + this._width / 4);
	var xTopBottomRight = Math.floor(this._x + this._width * 3 / 4);

	var y = Math.floor(this._y);

	// collision bottom
	if(y >= 0 && (map.getTile(y, xTopBottomLeft).getType() == TileTypes.Solid || map.getTile(y, xTopBottomRight).getType() == TileTypes.Solid) && this._velocity.y < 0) {
		this._y = y + 1;
		y += 1;
		this.onCollisionBottom();
	}


	var yTop = Math.ceil( this._y + this._height - 1);
	if(yTop >= 0 &&  yTop <= map.getHeight() - 1 &&  this._velocity.y > 0) {

		if(map.getTile(yTop, xTopBottomLeft).getType() == TileTypes.Solid && map.getTile(yTop, xTopBottomRight).getType() == TileTypes.Solid) {
			this._y = yTop - this._height;

			if(Helper.distance(this._x, xTopBottomLeft) < Helper.distance(this._x, xTopBottomRight ))
				this.onCollisionTop(xTopBottomLeft, yTop);
			else
				this.onCollisionTop(xTopBottomRight, yTop);

		} else if(map.getTile(yTop, xTopBottomLeft).getType() == TileTypes.Solid)  {
			this._y = yTop - this._height;

			this.onCollisionTop(xTopBottomLeft, yTop);

		} else if(map.getTile(yTop, xTopBottomRight).getType() == TileTypes.Solid) {
			this._y = yTop - this._height;

			this.onCollisionTop(xTopBottomRight, yTop)
		}

	}

	for(var yb = y; yb <= y + Math.floor(this._height); yb++) {
		// collision left
		if(xLeft >= 0 && yb >= 0 && map.getTile(yb, xLeft).getType() == TileTypes.Solid && this._velocity.x < 0) {
			if(this._x < xLeft + 1 ) {
				this._x = xLeft + 1;
				this.onCollisionLeft();
			}
		}

		// collision right
		if(xRight <= this._tileMap.getWidth() && yb >= 0 && map.getTile(yb, xRight).getType() == TileTypes.Solid && this._velocity.x > 0) {
			if(this._x + this._width > xRight) {
				this._x = xRight - this._width;
				this.onCollisionRight();
			}
		} 	
	}
}
Character.prototype.setState = function(s) { this._state = s;}
Character.prototype.getState = function() { return this._state; }
Character.prototype.getX = function() { return this._x; }
Character.prototype.getY = function() { return this._y; }
Character.prototype.getHeight = function() { return this._height; }
Character.prototype.getWidth = function() { return this._width; }
Character.prototype.draw = function(ctx) { return; }
Character.prototype.onCollisionRight = function() { return; }
Character.prototype.onCollisionLeft = function() { return; }
Character.prototype.onCollisionBottom = function() { return; }
Character.prototype.onCollisionTop = function(x, y) { return; }
Character.die = function() { return; }
Character.prototype.inside = function(ax1, ax2, ay1, ay2) {
	var bx1 = this._x;
	var bx2 = this._x + this._width;
	var by1 = this._y;
	var by2 = this._y + this._height;

	return Helper.intersectRect(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
}
Character.prototype.intersects = function(otherChar) {
	var ax1 = this._x;
	var ax2 = this._x + this._width;

	var ay1 = this._y;
	var ay2 = this._y + this._height;

	var bx1 = otherChar._x;
	var bx2 = otherChar._x + otherChar._width;	

	var by1 = otherChar._y;
	var by2 = otherChar._y + otherChar._height;

	return Helper.intersectRect(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
}

/* Mario */
Mario = function(tileMap, x, y) {
	Character.call(this, tileMap, x, y);

	this._frame = 0;

	this._deathFrame = 0;
	this._deathY = 0;

	this._width = 1;
	this._height = 1.6875;

	this._sprites = SpriteSheet.commonSprites;

	this.runAniamtion = [0, 1, 2, 1];

	this._directions ={
		Left: 0,
		Right: 1
	};

	this._state = CharacterStates.Standing;

	this._direction = this._directions.Right;
}

Mario.prototype = Object.create(Character.prototype);

Mario.prototype.constructor = Mario;

Mario.prototype.disableUserInput = function() { this._inputEnabled = false; }

Mario.prototype.die = function() {
	this._height = 1;
	this.setState(CharacterStates.Dying);
	Sound.play(SoundFX.Death);
	this._deathY = this._y;
	this._velocity.y = Constants.MarioDeathVelocity;
}

Mario.prototype.updateState = function() {

	var sgn = this._velocity.x > 0 ? 1 : -1;

	this._velocity.x = sgn * Math.min(Math.abs(this._velocity.x), Constants.MarioMaxVelocity);

	
	if(Math.abs(this._velocity.x) <= Constants.MarioMinVelocity) {
		this._velocity.x = 0.0;
	}

	if(this._jumping == false) {
		if(this._velocity.x == 0.0) {
			this.setState(CharacterStates.Standing);
		} else {
			this.setState(CharacterStates.Running)
			this._direction = (sgn == 1 ? this._directions.Right : this._directions.Left);
		}
	}

	if(this._y < 0)
		this.die();
}

Mario.prototype.update = function() {


	this._frame++;

	if(this.getState() == CharacterStates.Dead) {
		return;
	} 

	if(this.getState() == CharacterStates.Dying) {
		this._deathFrame++;

		if(this._deathFrame > 75) {

			if(this._y < -this._height) {
				this.setState(CharacterStates.Dead);
			} else { 
				this._velocity.y -= Constants.MarioDeathGravity;
				this._y += this._velocity.y;
			}
		}

	} else {
		if(this._inputEnabled) {
			if(KeyState.up() && !this._jumping && this._velocity.y == 0) {
				Sound.play(SoundFX.Jump);
				this._velocity.y = Constants.MarioJumpVelocity;
				this._jumping = true;
				this.setState(CharacterStates.Jumping);
			}

			if(KeyState.left()) {
				if(this._velocity.x > 0)
					this._velocity.x *= 0.5;
				this._velocity.x -= Constants.MarioAcceleration;
			} else if(KeyState.right()) {
				if(this._velocity.x < 0)
					this._velocity.x *= 0.5;
				this._velocity.x += Constants.MarioAcceleration;			
			} else {
				this._velocity.x *= 0.5;
			}
		}

		
		this._velocity.y -= Constants.Gravity;
		this._y += this._velocity.y;
		this._x += this._velocity.x;

		Character.prototype.update.call(this);
		
		this.updateState();
	}
}

Mario.prototype.onCollisionBottom = function() {
	this._velocity.y = 0;
	this._jumping = false;
}

Mario.prototype.onCollisionTop = function(x, y) {
	this._velocity.y = 0;

	var tile = this._tileMap.getTile(y, x);

	if(tile.onHit)
		tile.onHit();
}

Mario.prototype.onCollisionLeft = Mario.prototype.onCollisionRight = function() { this._velocity.x = 0; }

Mario.prototype.draw = function(ctx) {

	ctx.save();

	if(this._direction == this._directions.Right) {
		ctx.translate(Math.round(this._width * Constants.TileSize), 0);
		ctx.scale(-1, 1);
	}

	switch(this.getState()) {
		case CharacterStates.Standing:
			this._sprites.draw(0, ctx, 0, -this._height * Constants.TileSize, this._width * Constants.TileSize, this._height * Constants.TileSize);
			break;
		case CharacterStates.Running:
			var id = Math.floor(this._frame / 5) % 3;
			this._sprites.draw(id, ctx, 0, -this._height * Constants.TileSize, this._width * Constants.TileSize, this._height * Constants.TileSize);		
			break;
		case CharacterStates.Jumping:
			this._sprites.draw(3, ctx, 0, -this._height * Constants.TileSize, this._width * Constants.TileSize, this._height * Constants.TileSize);
			break;
		case CharacterStates.Dying:
			this._sprites.draw(6, ctx, 0, -this._height * Constants.TileSize, this._width * Constants.TileSize, this._height * Constants.TileSize);
			break;
	}

	ctx.restore();
}

Goomba = function(tileMap, x, y) {
	Character.call(this, tileMap, x, y);

	this._frame = 0;
	this._deathFrame = 0;

	this._width = 1;
	this._height = 1;

	this._velocity.x = -0.05;

	this._animation = [ 4, 5 ];

	this._state = CharacterStates.Running;
}

Goomba.prototype = Object.create(Character.prototype);
Goomba.prototype.constructor = Goomba;

Goomba.prototype.update = function() {

	this._frame++;

	if(this.getState() == CharacterStates.Running) {

		this._velocity.y -= Constants.Gravity;

		this._x += this._velocity.x;
		this._y += this._velocity.y;

		Character.prototype.update.call(this);
	} else if(this.getState() == CharacterStates.Dying) {

		this._height = Math.floor( (1 - (this._deathFrame / 20)) * 4) / 4;
		
		if(this._deathFrame++ >= 20) {
			this.setState(CharacterStates.Dead);
		}
	}
}

Goomba.prototype.onCollisionLeft = Goomba.prototype.onCollisionRight = function () { this._velocity.x *= -1; }
Goomba.prototype.onCollisionBottom = function() { 
	this._velocity.y = 0; 
}

Goomba.prototype.die = function() {
	Sound.play(SoundFX.Stomp);
	this.setState(CharacterStates.Dying);
	this._velocity.x = 0;
	this._velocity.y = 0;
}

Goomba.prototype.draw = function(ctx) {
	var sprite = Math.round(this._frame / 10) % 2;
	SpriteSheet.commonSprites.draw(
		this._animation[sprite], 
		ctx,
		0, 
		-this._height * Constants.TileSize, 
		this._width * Constants.TileSize, 
		this._height * Constants.TileSize
	);
}

/* Game renderer & logic */
Engine = function(canvas) {

	this._gameState = GameStates.Loading;
	this._canvas = canvas;
	this._ctx = canvas.getContext("2d");
	this._ctx.font = "bolder 30px Verdana";
	this._tileMap = null;
	this._spriteSheet = SpriteSheet.commonTiles;

	this._scale = canvas.height / Constants.VirtualHeight;

	this._vCanvasHeight = Constants.VirtualHeight;
	this._vCanvasWidth = Constants.VirtualWidth = (canvas.width / this._scale);

	this._height = this._vCanvasHeight / Constants.TileSize;
	this._width = this._vCanvasWidth / Constants.TileSize;
	this._character = null;
	this._enemies = null;
	this._backgrounds = null;

	this._musicSoundChannel = null;

	this._splashFrame = 0;
	this._loadingFrame = 0;

	canvas.idtkScale = "ScaleToFill";

	canvas.addEventListener("mousedown", function() {
		KeyState['md'] = true;
	});

	canvas.addEventListener("touchstart", function() {
		KeyState['md'] = true;
	});

	canvas.addEventListener("mouseup", function() {
		delete KeyState['md'];
	});

	canvas.addEventListener("touchend", function() {
		delete KeyState['md'];
	});


	this.startLevel = function() {
		var lvl = new Level1();
		this._tileMap = lvl.map;
		this._character = lvl.mario;
		this._enemies = lvl.enemies;
		this._backgrounds = lvl.backgrounds;
		this._endX = lvl.endX;
		this._endY = lvl.endY;
		this._castleDoorX = lvl.castleDoorX;
		this._endingFrame = -1;
		this._splashFrame = 0;
	}

	this.reshape = function() {
		//this._height = this._canvas.height / Constants.TileSize;
		//this._width = this._canvas.width / Constants.TileSize;		
	}

	this.reshape();
	this.startLevel();

	this.update = function () {

		var ch = this._character;
		var en = this._enemies;
		var map = this._tileMap;
		var endX = this._endX;
		var endY = this._endY;
		if(this._gameState == GameStates.Loading) {
			this._loadingFrame++;
			if(resourceLoader.isDone())
				this._gameState = GameStates.Splash;
		} else if(this._gameState == GameStates.Splash) {	
			this._splashFrame++;
			if(this._splashFrame > 60 && KeyState.enter()) {
				this.startLevel();
				this._gameState = GameStates.Playing;
				this._musicSoundChannel = Sound.play(SoundFX.Music);
				Sound.getChannel(this._musicSoundChannel).loop = true;
			}
		} else if(this._gameState == GameStates.StageEnding) {

			ch.update();

			if(this._endingFrame >= 0) {
				if(this._endingFrame >= 30) {
					if(KeyState.enter()) {
						Sound.stop(this._musicSoundChannel);
						this._gameState = GameStates.Splash;
					}
				} else {
					this._endingFrame++;
				}
				return;
			}

			if(ch.getY() > 3) {
				ch._x = endX;
				ch._velocity.x = 0;
			} else {
				if(ch.getX() < this._castleDoorX)
					ch._velocity.x = Constants.MarioMaxVelocity;
				else {
					this._endingFrame = 0;
					ch._velocity.x = 0;
				}
			}
	 	} else if(this._gameState == GameStates.Playing) {

			ch.update();

			/* Check for level end */
			if(ch.getX() >= endX) {
				ch._x = endX;

				if(ch.getY() <= endY) {
					this._gameState = GameStates.StageEnding;
					ch.disableUserInput();
					Sound.stop(this._musicSoundChannel);
					this._musicSoundChannel = Sound.play(SoundFX.StageClear);
				}
			}

			if(ch.getState() == CharacterStates.Dead) { // Dead -> back to splash
				this._gameState = GameStates.Splash;
			}

			if(ch.getState() == CharacterStates.Dying) { // Don't update enemies if mario is dying
				Sound.stop(this._musicSoundChannel); // Turn off the music
				return;
			}

			var minX = Math.max(0, ch.getX() - Constants.OffsetX);
			var minY = Math.max(0, ch.getY() - Constants.OffsetY);
			var maxX = minX + this._width;
			var maxY = minY + this._height;

			var rMinX = Math.floor(minX);
			var rMaxX = Math.min(Math.ceil(maxX), map.getWidth());
			var rMinY = Math.floor(minY);
			var rMaxY = Math.min(Math.ceil(maxY), map.getHeight());

			// Update tiles 
			for(var j = rMinX; j < rMaxX; j++) {
				for(var i = rMinY; i < rMaxY; i++) {
					var t = map.getTile(i, j);
					if(t && t.update) t.update();
				}
			}

			for(var i = 0; i < en.length; i++) {
				if(en[i].getState() != CharacterStates.Dead && en[i].inside(minX, maxX, minY, maxY)) {
					
					en[i].update(); // Update enemies

					if(en[i].getState() == CharacterStates.Running && ch.intersects(en[i])) { // Check collision with character
						if(ch._velocity.y < 0 && ch.getY() > en[i].getY() + en[i].getHeight() / 2) { // Hit enemy	
							en[i].die();
							ch._velocity.y = Constants.MarioStompVelocity;
						} else if(ch.getY() <= en[i].getY() + en[i].getHeight() / 2) { // Hit character
							ch.die();
						}					
					}
				}
			}
		}
	}

	this.render = function()  {

		var ctx = this._ctx;
		var ch = this._character;
		var en = this._enemies;
		var map = this._tileMap;
		var bgs = this._backgrounds;
		var canvas = this._canvas;

		ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		ctx.save();
		ctx.scale(this._scale, this._scale);

		if(this._gameState == GameStates.Loading) {
			
			var barWidth = this._vCanvasWidth / 2;
			var barHeight = 20;

			var progress = resourceLoader.getProgress();
			var str = Math.floor(progress * 100) + "%";

			ctx.fillStyle = "#fff";

			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#08f";
			ctx.strokeStyle = "#000";
			ctx.fillRect((this._vCanvasWidth - barWidth) / 2, (this._vCanvasHeight - barHeight) / 2, progress * barWidth, barHeight);
			ctx.strokeRect((this._vCanvasWidth - barWidth) / 2, (this._vCanvasHeight - barHeight) / 2, barWidth, barHeight);

			this._drawText(
				str,
				"#ff0",
				"#000",
				(this._vCanvasWidth - ctx.measureText(str).width) / 2,
				this._vCanvasHeight / 2 + 12.5
			);


		} else if(this._gameState == GameStates.Splash) {
			ctx.fillStyle = "#8ff";
			ctx.fillRect(0, 0, this._vCanvasWidth, this._vCanvasHeight);

			if(bgs != null)
				for(var i = 0; i < bgs.length; i++) {
					bgs[i].draw(ctx, this._canvas, this._splashFrame / 30, 0, this._scale);
				}		

			ctx.drawImage(
				Images.Title, 
				(this._vCanvasWidth - Images.Title.width) /2,
				(this._vCanvasHeight - Images.Title.height) / 2,
				Images.Title.width,
				Images.Title.height
			);

			if(this._splashFrame > 60) {
				if(Math.floor(this._splashFrame / 15) % 2 == 0) {

					this._drawText(
						Constants.PressEnter, 
						"#ff0",
						"#000",
						(this._vCanvasWidth - ctx.measureText(Constants.PressEnter).width) / 2,
						this._vCanvasHeight - 60
					);

				}
			}

		

		} if(this._gameState == GameStates.Playing || this._gameState == GameStates.StageEnding) {

			/* Temp cielo **/
			ctx.fillStyle ="#8ff";
			ctx.fillRect(0, 0, this._vCanvasWidth, this._vCanvasHeight);

			var offX = Math.max(0, ch.getX() - Constants.OffsetX);
			var offY = Math.max(0, ch.getY() - Constants.OffsetY);

			var minX = Math.floor(offX);
			var maxX = Math.min(Math.ceil(this._width + offX), map.getWidth());

			var minY = Math.floor(offY);
			var maxY = Math.min(Math.ceil(this._height + offY), map.getHeight());

			var translateX = minX - offX;
			var translateY = offY - minY;
			

			/* Parallax backgrounds */

			for(var i = 0; i < bgs.length; i++) {
				bgs[i].draw(ctx, this._canvas, offX, offY, this._scale);
			}				

			/* Foreground */
			
			for(var i = minY; i < maxY; i++)
				for(var j = minX; j < maxX; j++) {
					var t = map.getTile(i, j);
					t.draw(ctx, translateX + (j - minX), (translateY + this._height - (i - minY) - 1))
				}

			
			/* Draw mario */			
			ctx.save();

			var x, y;
			// Da rivedere (tonto!)
			x = Math.floor((offX == 0 ? ch.getX() : Constants.OffsetX) * Constants.TileSize);
			y = Math.floor((offY == 0 ? this._height - ch.getY() : this._height - Constants.OffsetY) * Constants.TileSize);

			ctx.translate(x, y);


			if(this._endingFrame > 0)
				ctx.globalAlpha = 1 - this._endingFrame / 30;


			ch.draw(ctx);

			ctx.restore();

			/* Draw enemies */
			for(var i = 0; i < en.length; i++) {
				var e = en[i];
				if(e && e != null && e.getState() != CharacterStates.Dead) {
					ctx.save();

					x = Math.floor((e.getX() - offX) * Constants.TileSize)
					y = Math.floor((this._height - e.getY() + offY) * Constants.TileSize);

					ctx.translate(x, y);
					e.draw(ctx);

					ctx.restore();
				}
			}

			/* Draw "Stage clear" */
			if(this._gameState == GameStates.StageEnding && this._endingFrame >= 30) {
				this._drawText(
					Constants.StageClear,
					"ff0",
					"000",
					(canvas.width - ctx.measureText(Constants.StageClear).width) / 2,
					(canvas.height - 40) / 2
				);
			}


		}
		ctx.restore();
	}
	
	this._drawText = function(text, fill, stroke, x, y) {

		var ctx = this._ctx;

		ctx.save();
		ctx.lineWidth = 2;
		ctx.strokeStyle = stroke;
		ctx.fillStyle = fill;

		ctx.fillText(text, x, y);

		ctx.strokeText(text, x, y);

		ctx.restore();
	}

	resourceLoader.startLoading();
}