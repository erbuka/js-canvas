Sun = Class.extend({
	init : function(canvas, ctx, song) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.song = song;

		ctx.fillStyle = "rgba(0,0,0,255)";
		ctx.fillRect(0,0,canvas.width,canvas.height);
	},
	draw : function() {
		var ctx = this.ctx;
		var canvas = this.canvas;
		
		var data = this.fetchFrequencyData(false);
		var dataLow = Random.shuffleByteArray(data.slice(0, Math.floor(data.length / 2)));
		var dataHigh = Random.shuffleByteArray(data.slice(Math.ceil(data.length / 2)));
		var timeData = this.fetchTimeData();

		this.darken(ctx);
		
		/*
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = .05;
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.fillRect(0, 0, canvas.width,canvas.height);
		*/
		
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "lighter";

		// orange
		this.drawRays(ctx, dataLow, this.canvas.width / 6, this.canvas.width / 2.5, "rgba(75, 55, 30, .1)", this.getRotation(50000), .1);

		//red
		this.drawRays(ctx, dataLow, this.canvas.width / 12, this.canvas.width / 1, "rgba(75, 35, 10, .1)", this.getRotation(40000), .1);

		//yellow
		this.drawRays(ctx, dataHigh, this.canvas.width / 12, this.canvas.width / 1, "rgba(75, 75, 40, .1)", this.getRotation(70000), .1);

		//white
		this.drawRays(ctx, dataHigh, this.canvas.width / 12, this.canvas.width / 1, "rgba(40, 40, 40, .1)", this.getRotation(100000), .1);

		// sun
		this.drawSun(ctx, timeData, this.canvas.width / 8, this.canvas.width / 4, "rgba(40, 40, 40, .1", 0, .25);


		
	},
	sampleAverage : function(byteArray) {
		var avg = 0;
		for(var i = 0; i < byteArray.length; i++) {
			avg += byteArray[i] / 256;
		}

		return avg / byteArray.length;
	},
	darken : function(ctx) {
		var canvas = ctx.canvas;
		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var pixels = imgData.data;
		var length = pixels.length;
		for(var i = 0; i < length; i += 4) {
			var red = pixels[i] = Math.floor(pixels[i] * .95);
			var green = pixels[i + 1] = Math.floor(pixels[i + 1] * .95);
			var blue = pixels[i + 2] = Math.floor(pixels[i + 2] * .95);
			// var alpha = pixels[i + 3] = Math.floor(pixels[i + 3] * .95);
		}

		ctx.putImageData(imgData, 0, 0);
	},
	fetchTimeData : function() {
		return this.song.getTimeData();
	},
	fetchFrequencyData : function(shuffle) {
		var song = this.song;

		var data = song.getFrequencyData();
		var start = 0;
		var end = data.length;

		var result = new Uint8Array(end - start);

		for(var i = start; i < end; i++) {
			result[i - start] = data[i];
		}

		if(shuffle) {
			var shuffleData = Random.getShuffleData(result.length);
			var shuffled = new Uint8Array(result.length);
			for(var i = 0; i < shuffleData.length; i++) {
				shuffled[i] = result[shuffleData[i]];
			}
			return shuffled;
		} else {
			return result;
		}

	},
	getRotation : function(millis) {
		return (Date.now() % millis) / millis * Math.PI * 2;
	},
	getFactor : function(sample, randomFactor) {
		var factor = sample / 256;
		var rnd = Math.random();

		return (1 - randomFactor) * factor + randomFactor * rnd;

	},
	drawSun : function(ctx, timeData, minRadius, maxRadius, fillStyle, rotation, randomness) {
		if(!rotation) {
			rotation = 0;
		}

		if(!randomness) {
			randomness = 0;
		}

		var canvas = ctx.canvas;

		
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(rotation);

		ctx.fillStyle = fillStyle;
		ctx.beginPath();
		for(var i = 0; i < timeData.length; i++) {
			var angle = i / timeData.length * Math.PI * 2;
			var factor = this.getFactor(timeData[i], randomness);
			var scale = minRadius * (1 - factor) + maxRadius * factor;
			var x = Math.cos(angle) * scale;
			var y = Math.sin(angle) * scale;
			if(i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	},
	drawRays : function(ctx, data, minRadius, maxRadius, fillStyle, rotation, randomness) {



		if(!rotation) {
			rotation = 0;
		}

		if(!randomness) {
			randomness = 0;
		}

		var canvas = ctx.canvas;
		var factor = 0;

		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(rotation);

		/*
		var avg = 0;
		for(var i = 0; i < data.length; i++) {
			avg += data[i] / 256;
		}
		avg /= data.length;
		ctx.globalAlpha = avg / 2 + .5;
		*/
		ctx.fillStyle = fillStyle;
		ctx.beginPath();

		factor = this.getFactor(data[0], randomness)
		
		ctx.moveTo(
			(1 - factor) * minRadius + factor * maxRadius,
			0
		);

		for(var i = 1; i < data.length; i++) {
			var angle = i / data.length * Math.PI * 2;
			factor = this.getFactor(data[i], randomness);
			var scale = minRadius * (1 - factor) + maxRadius * factor;
			var x = Math.cos(angle) * scale;
			var y = Math.sin(angle) * scale;
			ctx.lineTo(x, y); 
		}
		ctx.closePath();
		ctx.fill();

		ctx.restore();

	}
})