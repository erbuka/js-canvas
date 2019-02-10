class Brain
{
	constructor()
	{
		this.network = new NeuralNetwork();
	}
	getMoveDirection(position)
	{
		return new Vec2();		
	}
	cross(other, result, t)
	{
		result.network = this.network.cross(other.network, t);
	}
}

class GhostBrain extends Brain
{
	constructor()
	{
		super();
	}
	getMoveDirection(position)
	{
		var c = App.pacmans.filter(p => !p.dead).min(p => p.position.copy().sub(position).squaredLength());
		if(c.element != null)
		{
			var d = c.element.position.copy().sub(position).normalize();
			Math.abs(d.x) >= Math.abs(d.y) ? d.set(Math.sign(d.x), 0) : d.set(0, Math.sign(d.y));
			return d;
		}
		else
		{
			return new Vec2();
		}	
	}	
}

class PacmanBrain extends Brain
{
	constructor()
	{
		super();

		var nleft = new Neuron(2);
		var nright = new Neuron(2);
		var nup = new Neuron(2);
		var ndown = new Neuron(2);

		this.network.neurons = [nleft, nright, nup, ndown];

		// perfect brain
		/*
		nleft.bias = 1;
		nleft.weights[0] = -1;
		nleft.weights[1] = 0;

		nright.bias = 0;
		nright.weights[0] = 1;	
		nright.weights[1] = 0;	

		nup.bias = 1;
		nup.weights[0] = 0;	
		nup.weights[1] = -1;	

		ndown.bias = 0;
		ndown.weights[0] = 0;					
		ndown.weights[1] = 1;
		*/			
	}

	getMoveDirection(position)
	{
		var m = App.map;

		var closestFood = m.closest(Map.Food, position).element;
		var closestGhost = App.ghosts.min(g => g.position.copy().sub(position).squaredLength());
		var acc = new Vec2();

		if(closestFood != null)
		{
			acc.add(closestFood.position.copy().sub(position).normalize());
		}

		if(closestGhost.element != null && closestGhost.value <= 10)
		{
			acc.add(position.copy().sub(closestGhost.element.position).normalize().times(4));			
		}

		acc.normalize();

		var fDx = (acc.x + 1) / 2;
		var fDy = (acc.y + 1) / 2;

		for(var i = 0; i < this.network.length(); i++)
		{
			var n = this.network.at(i);

			n.setInput(0, fDx);
			n.setInput(1, fDy);

			n.activation();
		}

		var winner = this.network.neurons.max(x => x.output);

		if(winner.index != -1 && winner.element.output > 0.5)
		{
			return Vec2.directions[winner.index];
		}
		else
		{
			return new Vec2();
		}

	};


}

class Entity
{

	constructor()
	{
		this.position = new Vec2();
		this.speed = 2;
		this.rotationAngle = 0;		
		this.rnd = Math.random();
	}

	update(dt)
	{
		throw "Entity.update(dt): not implemented"
	}

	draw(ctx)
	{
		throw "Entity.draw(ctx): not implemented!"
	}

}

class BrainedEntity extends Entity
{
	constructor()
	{
		super();

		this.brain = null;
		this.target = null;
		this.lifeMax = 20;
		this.life = 0;
		this.dead = false;
		this.rotationAngle = 0;
	}

	update(dt)
	{

		if(this.life >= this.lifeMax)
		{
			this.dead = true;
			this.life = this.lifeMax;
		}

		if(this.dead)
		{
			return;
		}

		this.life += dt;



		if(this.target == null)
		{
			this.target = this.position.copy().add(this.brain.getMoveDirection(this.position));
			this.rotationAngle = this.target.copy().sub(this.position).normalize().angle();
		}

		if(App.map.get(this.target.x, this.target.y) != Map.Wall) {
			if(this.position.moveTowards(this.target, this.speed * dt))
			{
				// Target reached
				this.onTargetReached(dt);
				this.target = null;
			}
		}
		else
		{
			this.target = null;
		}
	}

	fitness() 
	{
		return 0;
	}

	onTargetReached(dt)
	{
		throw "Entity.onTargetReached(dt): not implemented!";
	}

	cross(other, t)
	{
		throw "Entity.cross(other, t): not implemented!"
	}
}

class Pacman extends BrainedEntity
{
	constructor()
	{
		super();
		var c = App.map.randomEmptyPosition();


		this.brain = new PacmanBrain();
		this.position.x = c.x;
		this.position.y = c.y;	
		this.foodEaten = 0;	
		this.killedByGhost = false;
	}

	onTargetReached(dt)
	{
		if(App.map.get(this.position.x, this.position.y) == Map.Food)
		{
			App.map.set(this.position.x, this.position.y, Map.Empty);
			this.foodEaten++;
		}		
	}

	draw(ctx)
	{

		if(!this.dead) {
			//var alpha = Math.max(0, Math.min(this.life, 1));
			var angle = Math.abs(Math.sin(App.elapsedTime * 5 + this.rnd * 2 * Math.PI)) * Math.PI / 6;

			ctx.save();
			{
				ctx.translate(this.position.x + 0.5, this.position.y + 0.5);
				ctx.rotate(this.rotationAngle);
				ctx.fillStyle = "rgb(255, 255, 0)";
				ctx.beginPath();
				ctx.arc(0, 0, 0.5, angle, 2 * Math.PI - angle);
				ctx.lineTo(0, 0)
				ctx.closePath();
				ctx.fill();
			}
			ctx.restore();		
		}
	}

	fitness()
	{
		return this.foodEaten;
	}

	cross(other, t)
	{
		var result = new Pacman();
		this.brain.cross(other.brain, result.brain, t);
		return result;
	}
}

class Ghost extends BrainedEntity
{
	constructor()
	{
		super();
		var c = App.map.randomEmptyPosition();

		this.brain = new GhostBrain();
		this.position.x = c.x;
		this.position.y = c.y;
		this.color = Ghost.colorPool.random();			
	}

	update(dt)
	{
		super.update(dt);

		var c = App.pacmans.filter(p => !p.dead).min(p => p.position.copy().sub(this.position).squaredLength());

		if(c.element != null && c.value <= 0.5)
		{
			c.element.dead = true;
			c.element.killedByGhost = true;
		}

	}

	onTargetReached(dt)
	{
	
	}

	draw(ctx)
	{

		var dy = Math.sin(App.elapsedTime * 10 + this.rnd * 2 * Math.PI) * 0.3;

		ctx.save() 
		{
			ctx.fillStyle = this.color;			
			ctx.translate(this.position.x + 0.5, this.position.y + 0.5);
			ctx.beginPath();
			ctx.arc(0, 0, 0.5, Math.PI, 0);
			ctx.lineTo(0.5, 0.5);
			ctx.bezierCurveTo(0.16, 0.5 + dy, -0.17, 0.5 - dy, -0.5, 0.5);
			//ctx.lineTo(-0.5, 0.5);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.arc(-0.15, -0.1, 0.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(0.15, -0.1, 0.1, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}
}

Ghost.colorPool = [
	"rgb(253, 255, 0)",
	"rgb(234, 130, 229)",
	"rgb(70, 191, 238)",
	"rgb(208, 62, 25)",
	"rgb(219, 133, 28)"
];

class Map
{
	constructor()
	{
		this.data = [];
		this.initialFood = 0;

		for(var y = 0; y < App.settings.worldSize; y++)
		{
			for(var x = 0; x < App.settings.worldSize; x++)
			{
				this.data.push({
					x : x,
					y : y,
					value : Map.Empty,
					position : new Vec2(x, y)
				})
			}
		}

		for(var y = 1; y < App.settings.worldSize - 1; y++)
		{
			for(var x = 1; x < App.settings.worldSize - 1; x++)
			{
				if(Math.random() < App.settings.foodChance)
				{
					this.set(x, y, Map.Food);
					this.initialFood++;
				}
			}
		}

		for(var x = 0; x < App.settings.worldSize; x++)
		{
			this.set(x, 0, Map.Wall);
			this.set(x, App.settings.worldSize - 1, Map.Wall);
		}


		for(var y = 0; y < App.settings.worldSize; y++)
		{
			this.set(0, y, Map.Wall);
			this.set(App.settings.worldSize - 1, y, Map.Wall);
		}

	}

	has(value)
	{
		for(var i = 0; i < App.settings.worldSize * App.settings.worldSize; i++)
		{
			if(this.data[i].value == value)
			{
				return true;
			}
		}

		return false;
	}

	closest(value, position)
	{
		
		return this.data.filter(x => x.value == value).min(x => position.copy().sub(x.position).length());
	}

	randomEmptyPosition()
	{
		var f = this.data.filter(x => x.value == Map.Empty);
		return f.random();
	}

	is(x, y, value)
	{
		return (this.get(x, y) == value ? 1 : 0);
	}

	get(x, y)
	{
		return this.data[App.settings.worldSize * y + x].value;
	}

	set(x, y, value)
	{
		this.data[App.settings.worldSize * y + x].value = value;
	}

	count(value)
	{
		return this.data.filter(c => c.value == value).length;
	}

	draw(ctx)
	{
		for(var x = 0; x < App.settings.worldSize; x++)
		{
			for(var y = 0; y < App.settings.worldSize; y++)
			{
				switch(this.get(x, y))
				{
					case Map.Wall:
						ctx.fillStyle = "#f00";
						ctx.fillRect(x, y, 1, 1);
						break;
					case Map.Food:
						ctx.fillStyle = "#ff0";
						ctx.fillRect(x + 0.35, y + 0.35, 0.3, 0.3);
						break;
					default:
				}
			}
		}
	}
}

Map.Empty = 0;
Map.Wall = 1;
Map.Food = 2;

class App
{

	static start()
	{

		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.state = App.StateIdle;

		window.addEventListener("keyup", function(evt) {
			
			switch(evt.keyCode)
			{
				case 107: // add
					App.settings.timeRate = Math.min(App.settings.timeRate + 1, 20);
					break;
				case 109: // sub
					App.settings.timeRate = Math.max(App.settings.timeRate - 1, 1);
					break;
				case 68:
					App.settings.displayGraph = !App.settings.displayGraph;
					break;
			}

		});

		document.body.appendChild(this.canvas);

		this.startSimulation();
		this.loop();
	}

	static startSimulation()
	{
		this.map = new Map();
		this.pacmans = [];
		this.ghosts = [];
		this.generation = 0;
		this.elapsedTime = 0;
		this.generationStats = [];

		for(var i = 0; i < this.settings.population; i++)
		{
			this.pacmans.push(new Pacman());
		}

		for(var i = 0; i < this.settings.ghosts; i++)
		{
			this.ghosts.push(new Ghost());
		}

		this.state = App.StateRunning;
	}

	static newGeneration()
	{

		this.collectGenerationStats();

		this.map = new Map();
		this.generation++;


		var wheel = [];
		var cg = this.pacmans; // current generation

		// Create wheel of fortune
		for(var i = 0; i < cg.length; i++)
		{
			for(var j = -1; j < cg[i].fitness(); j++)
			{
				wheel.push(cg[i]);
			}
		}

		this.pacmans = [];

		// Selection
		while(this.pacmans.length < this.settings.population)
		{
			if(Math.random() < this.settings.mutationRate)
			{
				this.pacmans.push(new Pacman());
			}
			else
			{
				var p0 = wheel.random();
				var p1 = wheel.random();
				var t = Math.random();
				this.pacmans.push(p0.cross(p1, t));
			}
		}

		this.ghosts = [];
		for(var i = 0; i < this.settings.ghosts; i++)
		{
			this.ghosts.push(new Ghost());
		}		

	}

	static collectGenerationStats()
	{
		this.generationStats.push({
			generation : this.generation,
			casualties : this.pacmans.filter(p => p.killedByGhost).length / this.settings.population,
			remainingFood : this.map.count(Map.Food) / this.map.initialFood
		});
	}

	static adjustCanvas()
	{
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.scaleFactor = this.canvas.height / this.settings.worldSize;
		this.invScaleFactor = 1 / this.scaleFactor;
	}

	static update()
	{
		var dt = 1 / 60.0;

		this.elapsedTime += dt;

		if(!this.pacmans || this.pacmans.all(x => x.dead) || !this.map.has(Map.Food))
		{
			this.newGeneration();	
		}

		this.pacmans.forEach(p => p.update(dt));
		this.ghosts.forEach(g => g.update(dt));

	}

	static render()
	{
		var ctx = this.ctx;
		var w = this.canvas.width;
		var h = this.canvas.height;
		var ws = this.settings.worldSize;

		ctx.fillStyle = "#000";

		ctx.fillRect(0,0,w,h);
		ctx.lineWidth = this.invScaleFactor;

		ctx.save();
		{	
			ctx.scale(this.scaleFactor, this.scaleFactor);
			ctx.translate((w * this.invScaleFactor - this.settings.worldSize) / 2  ,0)

			this.map.draw(ctx);
			this.pacmans.forEach(p => p.draw(ctx));
			this.ghosts.forEach(g => g.draw(ctx));

		}
		ctx.restore();

	}

	static renderStats()
	{
		var fittest = this.pacmans.max(x => x.fitness()).element;
		var ctx = this.ctx;

		// Render stats
		ctx.font = "16px Verdana";
		ctx.fillStyle = "#fff";

		var casualties = Math.round(this.pacmans.filter(p => p.killedByGhost).length / this.settings.population * 100);
		var remainingFood = Math.round(this.map.count(Map.Food) / this.map.initialFood * 100);

		ctx.fillText("(+/-)Time rate: x" + App.settings.timeRate, 16, 128);
		ctx.fillText("(D)isplay: " + (this.settings.displayGraph ? "Graph" : "World"), 16, 160);
		
		ctx.fillText("Generation: " + this.generation, 16, 224);
		ctx.fillText("Fitness: " + (fittest != null ? fittest.fitness() : "N/A" ), 16, 256);
		ctx.fillStyle = "#f00"; ctx.fillText("Casualties: " + casualties +"%", 16, 288);
		ctx.fillStyle = "#ff0"; ctx.fillText("Remaining food: " + remainingFood  + "%", 16, 320);

	}

	static renderGraph()
	{
		var ctx = this.ctx;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		if(this.generationStats.length < 1)
		{
			return;
		}

		ctx.save();
		{
			ctx.scale(this.canvas.width / 100, this.canvas.height / 100);
			ctx.lineWidth = 100 / this.canvas.width;

			ctx.strokeStyle = "#ff0";
			ctx.beginPath();
			for(var i = 0; i <= 100; i++)
			{
				var k = this.generationStats.length - i - 1;
				if(k >= 0)
				{
					i == 0 ? 
						ctx.moveTo(100 - i, 100 - this.generationStats[k].remainingFood * 100) : 
						ctx.lineTo(100 - i, 100 - this.generationStats[k].remainingFood * 100);
				}
				else
				{
					ctx.lineTo(0, 100 - this.generationStats[0].remainingFood * 100)
				}
			}
			ctx.stroke();

			ctx.strokeStyle = "#f00";
			ctx.beginPath();
			for(var i = 0; i <= 100; i++)
			{
				var k = this.generationStats.length - i - 1;
				if(k >= 0)
				{
					i == 0 ? 
						ctx.moveTo(100 - i, 100 - this.generationStats[k].casualties * 100) : 
						ctx.lineTo(100 - i, 100 - this.generationStats[k].casualties * 100);
				}
				else
				{
					ctx.lineTo(0, 100 - this.generationStats[0].casualties * 100)
				}
			}
			ctx.stroke();

		}
		ctx.restore();
	}

	static loop()
	{
		this.adjustCanvas()

		if(this.state == App.StateRunning) 
		{
			for(var i = 0; i < this.settings.timeRate; i++)
			{
				this.update();
			}			
			this.settings.displayGraph ? this.renderGraph() : this.render();
			this.renderStats();
		}
		else
		{
			ctx.fillStyle = "#000";
			ctx.fillRect(0,0,this.canvas.width,this.canvas.height);			
		}
		window.requestAnimationFrame(() => { App.loop(); } );
	}

}

App.StateIdle = 0;
App.StateRunning = 1;

App.settings = {
	worldSize : 100,
	foodChance : 0.02,
	timeRate : 5,
	population : 50,
	ghosts: 4,
	mutationRate : 0.05,

	displayGraph : false
};

class UI
{
	static init()
	{	
		$("div#intro").css("display", "block");
		$("div#intro button#next").off("click").on("click", function() {
			$("div#intro").css("display", "none");
			UI.newSimulation();
		});

		this.parameters = [
			{ name : "worldSize", text : "World Size", min : 25, max : 200, step : 10 },
			{ name : "population", text : "Population", min : 10, max : 200, step : 10 },
			{ name : "mutationRate", text : "Mutation Rate", min : 0, max : 0.3, step : 0.01 },
			{ name : "ghosts", text : "Ghosts", min : 0, max : 10, step : 1 }
		];

		console.log(this.createSlider(this.parameters[0]));
	}

	static createSlider(parameter)
	{
		if(!App.settings[parameter.name])
		{
			throw "Invalid parameter: " + parameter.name;
		}

		var slider = $(document.getElementById("slider-template").innerHTML);

		slider.attr("s-min", parameter.min);
		slider.attr("s-max", parameter.max);
		slider.attr("s-step", parameter.step);
		slider.attr("s-val", App.settings[parameter.name]);
		slider.attr("s-text", parameter.text);
		slider.attr("s-id", parameter.name);

		return slider;

	}

	static newSimulation()
	{
		var paramsDiv = $("div#new-simulation div#params");

		paramsDiv.empty();
		this.parameters.forEach((e) => {
			paramsDiv.append($('<p>').append(this.createSlider(e)));
		});

		$("div#new-simulation button#start")
			.off("click")
			.on("click", function() {
				paramsDiv.find("input").each(function() {
					var me = $(this);
					App.settings[me.attr("id")] = me.val();
				});
				App.startSimulation();
				$("div#new-simulation").css("display", "none");
			});

		$("div#new-simulation button#close")
			.off("click")
			.on("click", function() {
				$("div#new-simulation").css("display", "none");
			});

		$("div#new-simulation").css("display", "block");
	}
}

(function() {
	window.addEventListener("load", function() {
		App.start();
		UI.init();
	});
})();