p_ship = {
         "height":0,
         "name":"ship",
         "polygon":[
                {
                 "x":0,
                 "y":0
                }, 
                {
                 "x":10,
                 "y":-33
                }, 
                {
                 "x":19,
                 "y":0
                }],
         "properties":
            {

            },
         "type":"",
         "visible":true,
         "width":0,
         "x":360,
         "y":220
        };

p_asteroids = [
    {
     "height":0,
     "name":"",
     "polygon":[
            {
             "x":0,
             "y":0
            }, 
            {
             "x":2,
             "y":-42
            }, 
            {
             "x":43,
             "y":-55
            }, 
            {
             "x":63,
             "y":-34
            }, 
            {
             "x":79,
             "y":-44
            }, 
            {
             "x":90,
             "y":-1
            }, 
            {
             "x":53,
             "y":14
            }, 
            {
             "x":23,
             "y":28
            }, 
            {
             "x":25,
             "y":5
            }],
     "properties":
        {

        },
     "type":"",
     "visible":true,
     "width":0,
     "x":213,
     "y":131
    }, 
    {
     "height":0,
     "name":"",
     "polygon":[
            {
             "x":0,
             "y":0
            }, 
            {
             "x":10,
             "y":-24
            }, 
            {
             "x":61,
             "y":-21
            }, 
            {
             "x":83,
             "y":-41
            }, 
            {
             "x":99,
             "y":-3
            }, 
            {
             "x":72,
             "y":4
            }, 
            {
             "x":95,
             "y":14
            }, 
            {
             "x":68,
             "y":42
            }, 
            {
             "x":23,
             "y":44
            }, 
            {
             "x":25,
             "y":14
            }],
     "properties":
        {

        },
     "type":"",
     "visible":true,
     "width":0,
     "x":454,
     "y":122
    }, 
    {
     "height":0,
     "name":"",
     "polygon":[
            {
             "x":0,
             "y":0
            }, 
            {
             "x":24,
             "y":-51
            }, 
            {
             "x":50,
             "y":-29
            }, 
            {
             "x":87,
             "y":-41
            }, 
            {
             "x":111,
             "y":-1
            }, 
            {
             "x":82,
             "y":17
            }, 
            {
             "x":100,
             "y":49
            }, 
            {
             "x":56,
             "y":51
            }, 
            {
             "x":32,
             "y":30
            }, 
            {
             "x":-9,
             "y":40
            }, 
            {
             "x":11,
             "y":14
            }],
     "properties":
        {

        },
     "type":"",
     "visible":true,
     "width":0,
     "x":271,
     "y":335
    }, 
    {
     "height":0,
     "name":"",
     "polygon":[
            {
             "x":0,
             "y":0
            }, 
            {
             "x":-21,
             "y":29
            }, 
            {
             "x":1,
             "y":50
            }, 
            {
             "x":57,
             "y":52
            }, 
            {
             "x":78,
             "y":19
            }, 
            {
             "x":110,
             "y":-11
            }, 
            {
             "x":65,
             "y":-42
            }, 
            {
             "x":13,
             "y":-38
            }, 
            {
             "x":36,
             "y":0
            }],
     "properties":
        {

        },
     "type":"",
     "visible":true,
     "width":0,
     "x":521,
     "y":260
    }, 
    {
     "height":0,
     "name":"",
     "polygon":[
            {
             "x":0,
             "y":0
            }, 
            {
             "x":-27,
             "y":33
            }, 
            {
             "x":4,
             "y":60
            }, 
            {
             "x":45,
             "y":46
            }, 
            {
             "x":45,
             "y":70
            }, 
            {
             "x":101,
             "y":32
            }, 
            {
             "x":90,
             "y":14
            }, 
            {
             "x":82,
             "y":-15
            }, 
            {
             "x":40,
             "y":-46
            }, 
            {
             "x":40,
             "y":0
            }],
     "properties":
        {

        },
     "type":"",
     "visible":true,
     "width":0,
     "x":88,
     "y":230
    }
];

ResID = {
    fx_shoot : "shoot",
    fx_tonelo : "tonelo",
    fx_tonehi : "tonehi",
    fx_thrust : "thrust",
    fx_bang : "bang"
}

Resources = [
    { id : ResID.fx_shoot, type : "audio", src : "sound/asteroids_shoot.ogg" },
    { id : ResID.fx_tonelo, type : "audio", src : "sound/asteroids_tonelo.ogg" },
    { id : ResID.fx_tonehi, type : "audio", src : "sound/asteroids_tonehi.ogg" },
    { id : ResID.fx_thrust, type : "audio", src : "sound/asteroids_thrust.ogg" },
    { id : ResID.fx_bang, type : "audio", src : "sound/asteroids_bang.ogg" }
];

var resourceLoader = new ResourceLoader();
resourceLoader.addAll(Resources);

var soundEngine = new SoundEngine(8);

soundEngine.loadSound(ResID.fx_shoot, resourceLoader.getResource(ResID.fx_shoot));
soundEngine.loadSound(ResID.fx_tonelo, resourceLoader.getResource(ResID.fx_tonelo));
soundEngine.loadSound(ResID.fx_tonehi, resourceLoader.getResource(ResID.fx_tonehi));
soundEngine.loadSound(ResID.fx_thrust, resourceLoader.getResource(ResID.fx_thrust));
soundEngine.loadSound(ResID.fx_bang, resourceLoader.getResource(ResID.fx_bang));

Constants = {
    Width: null,
    Height: 400,
    Loading : "LOADING",
    Title : "ASTEROIDS",
    Start : "PRESS ENTER TO START",
    GameOver : "GAME OVER",
    HighScore : "HIGHSCORE: ",
    ShipMaxVelocity : 6,
    ShipAcceleration : 0.1,
    ShipRotationVelocity : (Math.PI / 30),
    ShipInvincible : 180,
    MissileLife : 35,
    MissileVelocity: 12,
    MissileRate : 10
}


GameState = {
    LOADING : 0,
    SPLASH : 1,
    PLAYING : 2,
    DEATH : 3,
    GAMEOVER : 4,
    currentState : 0,
    currentLevel : 1,
    score : 0,
    lives : 3,
    highScore : 0,
    init : function() {
        GameState.lives = 3;
        GameState.score = 0;
        GameState.currentLevel = 1;
    },
    hs : function () {
        GameState.highScore = GameState.score > GameState.highScore ? GameState.score : GameState.highScore;        
    }
}
/*
TouchState = {
    ButtonRadius: 80,
    PadPosition: null,
    FirePosition: null,
    moving: false,
    firing: false,
    movingDir: new Vector2D(),
    down: false,
    tid_Moving: null,
    tid_Firing: null,
    _vec1: new Vector2D(),
    _vec2: new Vector2D(),
    isDown: function() { return this.down; },
    isMoving: function() { return this.moving; },
    isFiring: function() { return this.firing; },
    getMovingDirection: function() { return this.movingDir; },
    configure: function(canvas) {
        this.PadPosition = new Vector2D(this.ButtonRadius, canvas.height - this.ButtonRadius);
        this.FirePosition = new Vector2D(canvas.width - this.ButtonRadius, canvas.height - this.ButtonRadius);

        canvas.addEventListener("touchstart", function(evt) {
            var tl = evt.touches;
            for(var i = 0; i < tl.length; i++) {

                var p = new Vector2D(tl[i].clientX, tl[i].clientY);

                TouchState._vec1.setXY(tl[i].clientX, tl[i].clientY).setSub(TouchState.FirePosition);
                TouchState._vec2.setXY(tl[i].clientX, tl[i].clientY).setSub(TouchState.PadPosition);

                if(TouchState._vec1.length() <= TouchState.ButtonRadius) { 
                    TouchState.firing = true;
                    TouchState.tid_Firing = tl[i].identifier;
                } else {
                    if(TouchState._vec2.length() <= TouchState.ButtonRadius) {
                        TouchState.moving = true;
                        TouchState.movingDir.set(TouchState._vec2.setNormalize());
                        TouchState.tid_Moving = tl[i].identifier;
                    }
                }

                TouchState.down = true;

            }
        });

        canvas.addEventListener("touchmove", function(evt) {
            var tl = evt.changedTouches;
            for(var i = 0; i < tl.length; i++) {
                

                if(tl[i].identifier == TouchState.tid_Moving) {
                    //var p = new Vector2D(tl[i].clientX, tl[i].clientY).sub(TouchState.PadPosition);
                    TouchState.movingDir
                    	.setXY(tl[i].clientX, tl[i].clientY)
                    	.setSub(TouchState.PadPosition)
                    	.setNormalize();

                    	//p.normalize(); 
                }
            }          
        });

        canvas.addEventListener("touchend", function(evt) {
            var tl = evt.changedTouches;
            for(var i = 0; i < tl.length; i++) {
                if(tl[i].identifier == TouchState.tid_Moving)
                    TouchState.moving = false;

                if(tl[i].identifier == TouchState.tid_Firing)
                    TouchState.firing = false; 
            }      

            TouchState.down = false;
        });
    }
};*/

KeyState = {
    ENTER : 13,
    SPACE : 32,
    LEFT : 37,
    UP : 38,
    RIGHT : 39,
    DOWN : 40
};

Timers = {
    invincibleBlink : false,
    startBlink : false,
    init : function() {
        setInterval(function() {
            Timers.invincibleBlink = !Timers.invincibleBlink;
        }, 50);
        setInterval(function() {
            Timers.startBlink = !Timers.startBlink;
        }, 300)
    }
}

Timers.init();

window.addEventListener("keydown", function(evt) {
    KeyState[evt.keyCode] = true;
})
window.addEventListener("keyup", function(evt) {
    delete KeyState[evt.keyCode];
})

Music = {
    running : false,
    tonelo : false,
    minTimeout : 300,
    maxTimeout : 1000,
    stepTimeout : 10,
    curTimeout : null,
    timeout : null,
    start : function() {
        Music.stop();

        Music.running = true;
        Music.curTimeout = Music.maxTimeout;
        Music.timeoutFunc();
    },
    stop : function() {

        if(Music.timeout)
            clearTimeout(Music.timeout);

        Music.running = false;
    },
    timeoutFunc : function() {
        if(Music.running) {
            
            Music.tonelo ? soundEngine.play(ResID.fx_tonelo) : soundEngine.play(ResID.fx_tonehi);
            Music.tonelo = !Music.tonelo;

            if(Music.curTimeout > Music.minTimeout)
                Music.curTimeout -= Music.stepTimeout;
            
            Music.timeout = setTimeout(Music.timeoutFunc, Music.curTimeout);
        }
    }
}

GameObject = function(json) {
    this._velocity = new Vector2D();
    Polygon.call(this, json);
    this.center();  
}

GameObject.prototype = Object.create(Polygon.prototype);
GameObject.prototype.constructor = GameObject;

GameObject.prototype.update = function() {
    var t = new Vector2D();
    
    t.set(this._velocity);

    if(this._position.x < 0)
        t.x += Constants.Width;
    else if(this._position.x > Constants.Width)
        t.x = -Constants.Width;

    if(this._position.y < 0)
        t.y = Constants.Height;
    else if(this._position.y > Constants.Height)
        t.y = -Constants.Height;

    this.translate(t);

    Polygon.prototype.update.call(this);
}

GameObject.prototype.setVelocity = function(v) {
    this._velocity.set(v);
}

GameObject.prototype.addVelocity = function(v) {
    this._velocity.setAdd(v);
    
    var d = this._velocity.length();

    if(d > Constants.ShipMaxVelocity)
        this._velocity.set(this._velocity.divide(d).scale(Constants.ShipMaxVelocity));
}

Ship = function(position) {
    GameObject.call(this, p_ship);
    this._invincible = 0;
    this._missileReady = 0;
}

Ship.prototype = Object.create(GameObject.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {

    if(this._missileReady > 0)
        this._missileReady--;

    if(this._invincible > 0)
        this._invincible--;

    GameObject.prototype.update.call(this);
}

Ship.prototype.isInvincible = function () { return this._invincible > 0; }

Ship.prototype.fire = function() {
    if(this._missileReady == 0) {
        var a = Vector2D.getDirection(this._angle - Math.PI / 2);
        new Missile(this._position, a.scale(Constants.MissileVelocity));    
        this._missileReady = Constants.MissileRate;
        soundEngine.play(ResID.fx_shoot);
    }
}

Ship.prototype.init = function() {
    this.setPosition(new Vector2D(Constants.Width / 2, Constants.Height / 2));
    this._invincible = Constants.ShipInvincible;
    this._velocity.zero();
}

ShipExplosion = function(ship) {
    this.edges = ship.getEdges();
    this.velocities = [];

    
    for(var i = 0; i < this.edges.length; i++) {
        var rv = Vector2D.randomDirection();
        this.velocities.push(rv.setAdd(ship._velocity));
    }

}

ShipExplosion.prototype.update = function() {
	
    for(var i = 0; i < this.edges.length; i++) {
        this.edges[i][0].setAdd(this.velocities[i]);
        this.edges[i][1].setAdd(this.velocities[i]);
    }
}
ShipExplosion.prototype.stroke = function(ctx) {
    for(var i = 0; i < this.edges.length; i++) {
        ctx.beginPath();
        ctx.moveTo(this.edges[i][0].x, this.edges[i][0].y);
        ctx.lineTo(this.edges[i][1].x, this.edges[i][1].y);
        ctx.stroke();
    }
}

Missile = function(position, velocity) {
    this._position = new Vector2D();
    this._velocity = new Vector2D();

    this._position.set(position);
    this._velocity.set(velocity);

    this._life = Constants.MissileLife;

    Missile.objects[Missile.index] = this;
    this._id = Missile.index;

    Missile.index++;
}

Missile.prototype.kill = function() {
    delete Missile.objects[this._id];   
}

Missile.prototype.getPosition = function() { return this._position; }

Missile.prototype.update = function() {

    if(this._life <= 0) {
        this.kill();
        return;
    }

    this._position.setAdd(this._velocity);

    if(this._position.x < 0)
        this._position.x += Constants.Width;
    else if(this._position.x > Constants.Width)
        this._position.x -= Constants.Width;

    if(this._position.y < 0)
        this._position.y += Constants.Height;
    else if(this._position.y > Constants.Height)
        this._position.y -= Constants.Height;   

    this._life--;
}

Missile.prototype.fill = function(ctx) {
    ctx.beginPath();
    ctx.arc(this._position.x, this._position.y, 3, 0, Math.PI2);
    ctx.fill();
}

Missile.init = function() {
    Missile.objects = {};
    Missile.index = 0;  
}

Asteroid = function(position, level, velocity) {

    var ind = Math.floor(p_asteroids.length * Math.random());
    var sx = Math.max(1, level / 2);

    GameObject.call(this, p_asteroids[ind]);

    this.scale(1.0 / level);
    this.translate(position);
    if(velocity)
    	this._velocity.set(velocity);
    else
    	this._velocity.set(Vector2D.randomDirection().scale(sx));
    
    Asteroid.objects[Asteroid.index] = this;

    this._id = Asteroid.index;
    this._level = level;

    Asteroid.index++;
    Asteroid.count++;
}

Asteroid.prototype = Object.create(GameObject.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.kill = function() {
    Asteroid.count--;
    GameState.score += 100 * this._level;
    delete Asteroid.objects[this._id];
    soundEngine.play(ResID.fx_bang);
    if(this._level < 4) {
        var newLevel = this._level * 2;
        var vel_angle = Vector2D.getAngle(this._velocity.normalize());
        var vel_len = this._velocity.length();
        for(var i = 0; i < 2; i++) {
        	var vel = Vector2D.getDirection((i * 2 - 1) * Math.PI / 8 + vel_angle).scale(vel_len * 1.5);
            var a = new Asteroid(this._position, newLevel, vel);
            a.update();
        }
    }
}

Asteroid.init = function (howMany) {
    Asteroid.index = 0;
    Asteroid.objects = {};
    Asteroid.count = 0;

    if(howMany && howMany > 0) {
        for(var i = 0; i < howMany; i++) {
            var pos = new Vector2D(Math.random() * Constants.Width, Math.random() * Constants.Height);
            var a = new Asteroid(pos, 1);
        }               
    }
}

resourceLoader.startLoading();
