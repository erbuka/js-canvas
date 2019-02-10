// JavaScript Document

define("vecmath2d");

Math.PI2 = 2 * Math.PI;

Vector2D = function(x, y) {
	
	if(!x)
		x = 0;
		
	if(!y)
		y = 0;
	
	this.x = x;
	this.y = y;
}

Vector2D.prototype.constructor = Vector2D;
Vector2D.prototype.__constructorName__ = "Vector2D";

Vector2D.ZERO = new Vector2D();
Vector2D.X_AXIS = new Vector2D(1, 0);
Vector2D.Y_AXIS = new Vector2D(0, 1);

Vector2D.LEFT = new Vector2D(-1, 0);
Vector2D.RIGHT = new Vector2D(1, 0);
Vector2D.UP = new Vector2D(0, 1);
Vector2D.DOWN = new Vector2D(0, -1);


Vector2D.prototype.isZero = function() {
	return this.x == 0 && this.y == 0;
}


Vector2D.prototype.zero = function() {
	this.x = this.y = 0;
	return this;
}

Vector2D.prototype.set = function(other) {
	this.x = other.x;
	this.y = other.y;	
	return this;
}

Vector2D.prototype.setXY = function(x, y) {
	this.x = x;
	this.y = y;
	return this;
}

Vector2D.prototype.setAdd = function(other) {
	this.x += other.x;
	this.y += other.y;	
	return this;
}


Vector2D.prototype.setSub = function(other) {
	this.x -= other.x;
	this.y -= other.y;	
	return this;
}	

Vector2D.prototype.setScale = function(factor) {
	this.x *= factor;
	this.y *= factor;
	return this;	
}

Vector2D.prototype.setDivide = function(factor) {
	this.x /= factor;
	this.y /= factor;	
	return this;
}

Vector2D.prototype.setNormalize = function() {
	var len = this.length();
	this.x /= len;
	this.y /= len;
	return this;	
}

Vector2D.prototype.setTruncate = function(maxLength) {
	if(this.length() > maxLength)
		this.setNormalize().setScale(maxLength)

	return this;
}

Vector2D.prototype.setPerp = function() {
	return this.setXY(-this.y, this.x);
}

Vector2D.prototype.add = function(other) {
	return new Vector2D(this.x + other.x, this.y + other.y);	
}	

Vector2D.prototype.sub = function(other) {
	return new Vector2D(this.x - other.x, this.y - other.y);	
}

Vector2D.prototype.scale = function(factor) {
	return new Vector2D(this.x * factor, this.y * factor);	
}

Vector2D.prototype.divide = function(factor) {
	return this.scale(1.0 / factor);	
}

Vector2D.prototype.dot = function(other) {
	return this.x * other.x + this.y * other.y;	
}

Vector2D.prototype.perp = function() {
	return new Vector2D(-this.y, this.x);	
}

Vector2D.prototype.normalize = function() {
	var len = this.length();
	return new Vector2D(this.x / len, this.y / len);
}

Vector2D.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);	
}

Vector2D.prototype.distance = function(other) {
	var xx = this.x - other.x;
	var yy = this.y - other.y;
	return Math.sqrt(xx * xx + yy * yy);
}

Vector2D.prototype.distanceXY = function(x, y) {
	var xx = this.x - x;
	var yy = this.y - y;
	return Math.sqrt(xx * xx + yy * yy);
}

Vector2D.prototype.truncate = function(maxLength) {
	if(this.length() > maxLength) 
		return this.normalize().setScale(maxLength);
	else
		return new Vector2D().set(this);
}

Vector2D.prototype.lerp = function(other, delta) {
	return this.scale(1 - delta).setAdd(other.scale(delta));
}

Vector2D.prototype.stroke = function(ctx, scale, p) {
	if(!p)
		p = Vector2D.ZERO;

	if(!scale)
		scale = 1;

	ctx.beginPath();
	ctx.moveTo(p.x, p.y);
	ctx.lineTo(p.x + this.x * scale, p.y + this.y * scale);
	ctx.stroke();
}

Vector2D.getDirection = function(angle) {
	return new Vector2D(Math.cos(angle), Math.sin(angle)).setNormalize();
}

Vector2D.getDirectionRef = function(angle, v) {
	return v.setXY(Math.cos(angle), Math.sin(angle)).setNormalize();
}

Vector2D.getMirrorRef = (function() {
	var tmp0 = new Vector2D();
	var tmp1 = new Vector2D();
	return function(v, n, ref) {
		var proj = v.dot(n);
		proj = proj < 0 ? -proj : proj;
		tmp0.set(n).setScale(proj)
		tmp1.set(tmp0).setSub(v).setScale(2);
		return ref.set(v).setAdd(tmp1);
	}
})();

Vector2D.getAngle = function(direction) {
	/*
		non c'è bisogno di fare "dot" (credo)
		a1 = direction.x;
		a2 = direction.y;
	*/
	var a1 = direction.dot(Vector2D.X_AXIS);
	var a2 = direction.dot(Vector2D.Y_AXIS);

	var a = a2 >= 0 ? Math.acos(a1) : 2 * Math.PI - Math.acos(a1);

	return a;
}

Vector2D.randomDirection = function() {
	var a = Math.PI * 2 * Math.random();
	return new Vector2D(Math.cos(a), Math.sin(a)).normalize();
}