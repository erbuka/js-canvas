_DEBUG = {
	_points : {},
	_vectors : {},
	_spheres : {},
	_variables : {},
	addVariable : function(id, val) {
		this._variables[id] = val;
	},
	addSphere : function(id, c, r, color) {
		this._spheres[id] = {
			center : new Vector2D().set(c),
			radius : r,
			color : color
		};
	},
	addPoint : function(id, p, color) {
		this._points[id] = { x : p.x, y : p.y, color: color};
	},
	addVector : function(id, o, v, color) {
		this._vectors[id] = {
			origin: new Vector2D().set(o),
			vector: new Vector2D().set(v),
			color : color
		};
	},
	draw : function(ctx) {
		for(var i in this._points) {
			var p = this._points[i];
			ctx.fillStyle = p.color;
			ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
		}

		for(var i in this._vectors) {
			var v = this._vectors[i];
			ctx.strokeStyle = v.color;
			ctx.beginPath()
			ctx.moveTo(v.origin.x, v.origin.y);
			ctx.lineTo(v.origin.x + v.vector.x, v.origin.y + v.vector.y);
			ctx.stroke();
		}

		for(var i in this._spheres) {
			var s = this._spheres[i];
			ctx.strokeStyle = s.color;
			ctx.beginPath();
			ctx.arc(s.center.x, s.center.y, s.radius, 0, Math.PI2);
			ctx.stroke();
		}

		var y = 1;
		ctx.fillStyle = "#fff";
		for(var i in this._variables) {
			ctx.fillText(i + ": " + this._variables[i], 250, y++ * 10);
		}
	}
}