Vector3D = Class.extend({
	init : function(x, y, z) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
	},
	clone : function() {
		return new Vector3D(this.x, this.y, this.z);
	},
	set : function(x, y, z) {

		if(x.x !== undefined && x.y !== undefined && x.z !== undefined) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;			
		}

		return this;
	},
	setZero : function() {
		this.x = this.y = this.z = 0;
		return this;
	},
	setAdd : function(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	},
	setSub : function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	},
	setScale : function(k) {
		this.x *= k;
		this.y *= k;
		this.z *= k;
		return this;
	},
	setNormalize : function() {
		var length = this.length();
		this.x /= length;
		this.y /= length;
		this.z /= length;
		return this;
	},
	setCross : function(v1, v2) {
		this.x = v1.y * v2.z - v1.z * v2.y;
		this.y = v1.z * v2.x  - v1.x * v2.z;
		this.z = v1.x * v2.y - v1.y * v2.x;
		return this;
	},
	dot : function(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	},
	length : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},
	toString : function() {
		return "(" + this.x + ", " + this.y + ", " + this.z + ")";
	}
});

function v3d(x, y, z) {
	if(x !== undefined && x.x !== undefined && x.y !== undefined && x.z !== undefined) {
		return new Vector3D(x.x, x.y, x.z);
	} else {
		return new Vector3D(x, y, z);
	}
}

Vector3D.RIGHT = v3d(1, 0, 0);
Vector3D.LEFT = v3d(-1, 0, 0);
Vector3D.FORWARD = v3d(0, 0, 1);
Vector3D.BACKWARD = v3d(0, 0, -1);
Vector3D.UP = v3d(0, 1, 0);
Vector3D.DOWN = v3d(0, -1, 0);

