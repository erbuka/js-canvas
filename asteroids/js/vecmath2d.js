// JavaScript Document

Math.PI2 = 2 * Math.PI;

Vector2D = function(x, y) {
	
	if(!x)
		x = 0;
		
	if(!y)
		y = 0;
	
	this.x = x;
	this.y = y;
	
	this.zero = function() {
		this.x = this.y = 0;
	}
	
	this.set = function(other) {
		this.x = other.x;
		this.y = other.y;	
		return this;
	}

	this.setXY = function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
	
	this.setAdd = function(other) {
		this.x += other.x;
		this.y += other.y;	
		return this;
	}

	
	this.setSub = function(other) {
		this.x -= other.x;
		this.y -= other.y;	
		return this;
	}	
	
	this.setScale = function(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;	
	}
	
	this.setDivide = function(factor) {
		this.x /= factor;
		this.y /= factor;	
		return this;
	}

	this.setNormalize = function() {
		var len = this.length();
		this.x /= len;
		this.y /= len;
		return this;	
	}
	
	
	this.add = function(other) {
		return new Vector2D(this.x + other.x, this.y + other.y);	
	}	
	
	this.sub = function(other) {
		return new Vector2D(this.x - other.x, this.y - other.y);	
	}
	
	this.scale = function(factor) {
		return new Vector2D(this.x * factor, this.y * factor);	
	}
	
	this.divide = function(factor) {
		return this.scale(1.0 / factor);	
	}
	
	this.dot = function(other) {
		return this.x * other.x + this.y * other.y;	
	}
	
	this.perp = function() {
		return new Vector2D(-this.y, this.x);	
	}
	
	this.normalize = function() {
		var len = this.length();
		return new Vector2D(this.x / len, this.y / len);
	}
	
	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);	
	}
}

Vector2D.getDirection = function(angle) {
	return new Vector2D(Math.cos(angle), Math.sin(angle)).normalize();
}

Vector2D.getAngle = function(direction) {
	var a1 = direction.dot(Vector2D.X_AXIS);
	var a2 = direction.dot(Vector2D.Y_AXIS);

	var a = a2 >= 0 ? Math.acos(a1) : 2 * Math.PI - Math.acos(a1);

	return a;
}

Vector2D.randomDirection = function() {
	var a = Math.PI * 2 * Math.random();
	return new Vector2D(Math.cos(a), Math.sin(a)).normalize();
}

Vector2D.ZERO = new Vector2D();
Vector2D.X_AXIS = new Vector2D(1, 0);
Vector2D.Y_AXIS = new Vector2D(0, 1);