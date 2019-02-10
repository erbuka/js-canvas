
var shapes = [
	new Box(v3d(-5, -1, -5), v3d(5, 0, 5), Color.create(255,0,0)), // base
	new Box(v3d(-5, 0, -5), v3d(5, 1, -4), Color.create(128,128,128)), // wall-south
	new Box(v3d(-5, 0, 4), v3d(5, 1, 5), Color.create(128,128,128)), // wall-north
	new Box(v3d(-5, 0, -4), v3d(-4, 1, 4), Color.create(128,128,128)), // left-north
	new Box(v3d(4, 0, -4), v3d(5, 1, 4), Color.create(128,128,128)), // right-north
	new Sphere(v3d(-3, .5, -3), .5, Color.create(0,0,128)),
	new Sphere(v3d(3, .5, -3), .5, Color.create(0,128,128)),
	new Sphere(v3d(3, .5, 3), .5, Color.create(128,0,128)),
	new Sphere(v3d(-3, .5, 3), .5, Color.create(128,128,0)),
	new Box(v3d(-.25,0, -3), v3d(.25, .5, -2.5), Color.create(0,128,0))
];

window.addEventListener("load", function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	var imageData = null;
	var imageDataView32 = null;
	var imageDataView8 = null;

	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

	var keystate = {};
	
	var origin = v3d(0, .5, 0);
	var direction = v3d(0,0,1);
	var directionAngle = 0;
	var speed = 2; // 3 units/second
	var angularSpeed = Math.PI;
	var collisionBound = .2;

	var shadowsEnabled = true;
	var lightEnabled = true;

	var lightDirection = v3d(1, -1, -1).setNormalize();
	var invLightDirection = v3d().setSub(lightDirection);

	var helpDiv = document.getElementById("help");

	window.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;

		// toggle help visibility
		if(evt.keyCode == 72) { // 'h' down
			helpDiv.style.visibility = helpDiv.style.visibility == "visible" ? "hidden" : "visible";
		}

		if(evt.keyCode == 83) { // 's' down
			shadowsEnabled = !shadowsEnabled;
		}

		if(evt.keyCode == 76) { // 'l' down
			lightEnabled = !lightEnabled;
		}
	})

	window.addEventListener("keyup", function(evt) {
		delete keystate[evt.keyCode];
	});

	var init = function() {
		imageData = ctx.createImageData(canvas.width, canvas.height);
		var buf = new ArrayBuffer(imageData.data.length);
		imageDataView32 = new Uint32Array(buf);
		imageDataView8 = new Uint8ClampedArray(buf);
		loop();
	}

	var clamp = function(val, min, max) {
		if(val < min) return min;
		else if(val > max) return max;
		else return val;
	}



	var loop = (function() {
		var normal0 = v3d();
		var direction0 = v3d();
		var intersection0 = v3d();
		var intersection = v3d();
		var conj = v3d();
		var ray = new Ray();
		var shadowRay = new Ray();
		var prevTime = 0;
		var origin0 = v3d();
		var collision0 = v3d();
		return function() {

			var dt = (Date.now() - prevTime) / 1000;
			prevTime = Date.now();

			if(keystate[38] || keystate[40]) { // arrow up || arrowdown
				var factor = keystate[38] ? 1 : -1;

				origin0.set(origin).setAdd(direction0.set(direction).setScale(factor * speed * dt));

				// collision check
				var willCollide = false;
				collision0.set(direction).setScale(factor * collisionBound).setAdd(origin0);
				for(var i = 0; i < shapes.length; i++) {
					if(shapes[i].contains(collision0)) {
						willCollide = true;
						break;
					}
				}

				if(!willCollide) {
					origin.set(origin0);
				}


			} else if(keystate[37]) { // arrow left
				directionAngle += angularSpeed * dt;
			} else if(keystate[39]) { // arrow right
				directionAngle -= angularSpeed * dt;
			}


			direction.x = -Math.sin(directionAngle);
			direction.z = Math.cos(directionAngle);
			direction.setNormalize();


			for(var x = 0; x < canvas.width; x++) {
				for(var y = 0; y < canvas.height; y++) {
					Raycaster.createScreenRay(
						canvas.width,
						canvas.height,
						x,
						y,
						origin,
						direction,
						Vector3D.UP,
						Math.PI / 6,
						ray
					);

					// cast screen rays
					var distance = Number.MAX_VALUE;
					var color = 0;
					var shape = -1;

					for(var i = 0; i < shapes.length; i++) {
						if(Raycaster.geometricRaycast(ray, shapes[i], intersection0)) {
							var d = conj.set(intersection0).setSub(origin).length();
							if(d < distance) {
								distance = d;
								shape = i;
								color = shapes[i].diffuse;
								intersection.set(intersection0);

							}
						}
					}

					var shading = 1;

					

					if(shape != -1) { // the point is visible on the screen

						// calculate normal and shading
						if(lightEnabled) {
							shapes[shape].getNormal(intersection, normal0);
							shading = Math.max(.2, normal0.dot(invLightDirection));
						}
						// cast shadow rays
						if(shadowsEnabled) {
							shadowRay.set(intersection, invLightDirection);

							for(var j = 0; j <= shapes.length; j++) {
								if(j == shape)
									continue;

								if(Raycaster.geometricRaycast(shadowRay, shapes[j], intersection0)) { // point is in shadow
									shading = .2;
								}
							}
						}

						// additional shading based on distance
						shading *= clamp(1 - distance / 10, 0, 1);
						
					}
					

					if(distance < Number.MAX_VALUE) {
						// var decayFactor = clamp(1 - distance / 5, 0, 1);
						imageDataView32[y * canvas.width + x] = Color.decay(color, shading);
					} else {
						imageDataView32[y * canvas.width + x] = 0xff000000;
					}

				}
			}

			imageData.data.set(imageDataView8);

			ctx.putImageData(imageData,0,0);

			requestAnimationFrame(loop,ctx);			
		}
	})();

	init();
})