
Color = {
	RED : 0x000000ff,
	GREEN : 0x0000ff00,
	BLUE : 0x00ff0000,
	ALPHA : 0xff000000,
	create : function(red, green, blue) {
		return 0xff000000 | (blue << 16) | (green << 8) | red;
	},
	decay : function(color, decay) {
		var red = Math.round((color & this.RED) * decay)
		var green = Math.round(((color & this.GREEN) >> 8) * decay);
		var blue = Math.round(((color & this.BLUE) >> 16) * decay);

		return (color & this.ALPHA) | (green << 16) | (blue << 8) | red;
	}
}

Shape = Class.extend({
	init : function(diffuse) {
		this.diffuse = diffuse ? diffuse : 0xff0000ff;
	},
	contains : Class.abstract,
	getNormal : Class.abstract
})

Sphere = Shape.extend({
	init : function(center, radius, diffuse) {

		Shape.call(this, diffuse)

		this.center = v3d(center);
		this.radius = radius;
		this.radius2 = radius * radius;

		this._distance = v3d();
	},
	getNormal : function(p, normalRef) {
		normalRef = normalRef ? normalRef : v3d();	
		normalRef.set(p).setSub(this.center).setNormalize();
		return normalRef;
	},
	getInverseNormal : function(p, inormalRef) {
		inormalRef = inormalRef ? inormalRef : v3d();	
		inormalRef.set(this.center).setSub(p).setNormalize();	
		return inormalRef;	
	},
	contains : function(point) {
		return this._distance.set(point).setSub(this.center).length() < this.radius;
	}
});

Box = Shape.extend({
	init : function(vmin, vmax, diffuse) {

		Shape.call(this, diffuse);

		this.bounds = [
			v3d(vmin), 
			v3d(vmax)
		];

		this.center = v3d(
			(vmax.x - vmin.x) / 2 + vmin.x,
			(vmax.y - vmin.y) / 2 + vmin.y,
			(vmax.z - vmin.z) / 2 + vmin.z
		);

		this.width = vmax.x - vmin.x;
		this.height = vmax.y - vmin.y;
		this.depth = vmax.z - vmin.z;

		this.size = Math.max(this.width, Math.max(this.height, this.depth));
	},
	getNormal : (function() {
		var temp = v3d();
		var dirs = [
			Vector3D.UP,
			Vector3D.DOWN,
			Vector3D.LEFT,
			Vector3D.RIGHT,
			Vector3D.FORWARD,
			Vector3D.BACKWARD
		];
		var result = v3d();
		return function(p, normalRef) {
			temp.set(p).setSub(this.center).setNormalize();
			var max = -Number.MAX_VALUE;
			
			for(var i = 0; i < dirs.length; i++) {
				var v = Math.max(0, temp.dot(dirs[i]));

				if(i <= 1) { // up and down
					v *= this.size / this.height;
				} else if(i <= 3) { // left and right
					v *= this.size / this.width;
				} else { // forward and backward;
					v *= this.size / this.depth;
				}

				if(v > max) {
					max = v;
					result = dirs[i];
				}
			}

			if(normalRef) {
				normalRef.set(result);
			} else {
				return v3d(result);
			}

		}
	})(),
	contains : function(point) {
		var min = this.bounds[0];
		var max = this.bounds[1];
		return point.x >= min.x && point.y >= min.y && point.z >= min.z
			&& point.x <= max.x && point.y <= max.y && point.z <= max.z;
	}
})