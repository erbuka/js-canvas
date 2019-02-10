



$(function() {
	
	var levels = null;
	var currentLevel = null;

	var TILESIZE = 20;

	var COLORS = {
		0: "#000",
		10: "#f00"
	}

	var levelSelect = document.getElementById("level-select");
	var tileSelect = document.getElementById("tile-select");
	var canvas = document.getElementById("edit-canvas");
	var ctx = canvas.getContext("2d");

	canvas.addEventListener("mousemove", function(evt) {

		var x = Math.floor(evt.offsetX / TILESIZE);
		var y = Math.floor(evt.offsetY / TILESIZE);

		if(evt.buttons == 1) { // left
			currentLevel.set(x, y, parseInt(tileSelect.value));
			redrawCanvas();
		} else if(evt.buttons == 2) { // right
			currentLevel.set(x, y, 0);
			redrawCanvas();
		}
	});

	var saveLevels = function() {
		var serialized = Class.serialize(levels);
		$.ajax({
			url: "savelevels.php",
			type: "post",
			data: { "data" : JSON.stringify(serialized) }
		}).done(function(data) {
			levels = Class.deserialize(serialized);
		});
	}




	var init = function() {
		$.ajax({
			url: "../levels.json",
			type: "get",
			dataType: "json"
		}).done(function(data) {
			console.log("ciao");
			levels = Class.deserialize(data);
			updateList();
		}).fail( function (data) {
			console.error("An error occurred: " + data.responseText);
		});
	}

	var updateList = function() {
		while(levelSelect.length > 0) {
			levelSelect.remove(0);
		}

		for(var i = 0; i < levels.length; i++) {
			var opt = document.createElement("option");
			opt.text = i + "";
			opt.value = i;
			levelSelect.add(opt);
		}
	}

	var redrawCanvas = function() {
		window.requestAnimationFrame(function() {
			canvas.height = canvas.width = currentLevel.size * TILESIZE;
			for(var x = 0; x < currentLevel.size; x++) {
				for(var y = 0; y < currentLevel.size; y++) {
					ctx.fillStyle = COLORS[currentLevel.get(x, y)];
					ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
				}
			}
		});
	}

	var selectLevel = function(index) {
		currentLevel = levels[index];
		redrawCanvas();
	}

	$("input#save").on("click", function() {
		saveLevels();
	})


	$("input#delete").on("click", function() {
		if(levelSelect.selectedIndex >= 0) {
			levels.splice(levelSelect.selectedIndex, 1);
			updateList();
		}
	})


	$("input#new").on("click", function() {
		levels.push(new Level(21));
		updateList();
	});

	$("select#level-select").on("click", function() {
		if(levelSelect.selectedIndex >= 0) 
			selectLevel(levelSelect.selectedIndex);
	})


	init();


})