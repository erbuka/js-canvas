Interval = function() {
	this.a = 0;
	this.b = 0;
}

Interval.prototype.length = function () { return this.b - this.a; }

Interval.prototype.overlaps = function(other) {
	return 	(this.a >= other.a && this.a <= other.b) || (this.b >= other.a && this.b <= other.b) ||
			(other.a >= this.a && other.a <= this.b) || (other.b >= this.a && other.b <= this.b);
}

Interval.prototype.contains = function(x) {
	return x >= this.a && x <= this.b;
}
 
BoundingBox = function() {
	this.x1 = 0;
	this.x2 = 0;
	this.y1 = 0;
	this.y2 = 0;
}

BoundingBox.prototype.getWidth = function() { return this.x2 - this.x1; }
BoundingBox.prototype.getHeight = function() { return this.y2 - this.y1; }
BoundingBox.prototype.contains = function(p) { return this._contains(p.x, p.y); }
BoundingBox.prototype._contains = function(x, y) {
	return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
}
BoundingBox.prototype.intersects = function(otherBox) {
	return 	this._contains(otherBox.x1, otherBox.y1) || this._contains(otherBox.x2, otherBox.y1) ||
			this._contains(otherBox.x1, otherBox.y2) || this._contains(otherBox.x2, otherBox.y2) ||
			otherBox._contains(this.x1, this.y1) || otherBox._contains(this.x2, this.y1) ||
			otherBox._contains(this.x1, this.y2) || otherBox._contains(this.x2, this.y2);
}
BoundingBox.prototype.stroke = function(ctx) {
	ctx.beginPath();
	ctx.moveTo(this.x1, this.y1);
	ctx.lineTo(this.x2, this.y1);
	ctx.lineTo(this.x2, this.y2);
	ctx.lineTo(this.x1, this.y2);
	ctx.closePath();
	ctx.stroke();	
}

Polygon = function(json) {
	this._points = [];
	this._startingAngles = [];
	this._distances = [];
	this._position = new Vector2D();
	this._angle = 0;
	this._boundingBox = new BoundingBox();

	this._vec1 = new Vector2D();
	this._vec2 = new Vector2D();

	if(json) {

		for(var i = 0; i < json.polygon.length; i++)
			this.addVertex(new Vector2D(json.polygon[i].x, json.polygon[i].y))
		
		this.translate(new Vector2D(json.x, json.y));

		this.update();
	}
};

Polygon.prototype.getCentroid = function () {
	var centroid = new Vector2D();

	for(var i = 0; i < this._points.length; i++) 
		centroid.setAdd(this._points[i]);

	centroid.setDivide(this._points.length);

	return centroid;
}

Polygon.prototype.getEdges = function() {
	var edges = [];
	for(var i = 0; i < this._points.length; i++) {
		edges.push([
			new Vector2D().set(this._points[i]),
			new Vector2D().set(this._points[(i + 1) % this._points.length])
		]);
	}	
	return edges;
}

Polygon.prototype.center = function() {
	var centroid = this.getCentroid();

	var newPoints = [];

	for(var i = 0; i < this._points.length; i++) 
		newPoints.push(this._points[i].sub(centroid));

	this._points = [];
	this._startingAngles = [];
	this._distances = [];
	this.reset();

	for(var i = 0; i < newPoints.length; i++) 
		this.addVertex(newPoints[i]);

	this.update();

	return this;
}

Polygon.prototype.getBoundingBox = function() { return this._boundingBox; }

Polygon.prototype.contains = function(p) {
	if(!this._boundingBox.contains(p))
		return false;
	else {

		var t = this,
			a = null,
			b = null,
			c = false;

		for(var i = 0; i < t._points.length; i++) {
			a = t._points[i];
			b = t._points[(i + 1) % t._points.length];

			if((a.y > p.y) != (b.y > p.y) && p.x < (a.x - b.x) * (p.y - b.y) / (a.y - b.y) + b.x)
				c = !c;
		}
		

		return c;
	}
};

Polygon.prototype.intersects = function(otherPoly)  {
	if(!this._boundingBox.intersects(otherPoly._boundingBox)) {
		return false;
	} else {

		var t = this,  o = otherPoly;

		for(var i = 0; i < t._points.length; i++) {

			if(o.contains(t._points[i]))
				return true;
		}

		for(var i = 0; i < o._points.length; i++) {
			if(t.contains(o._points[i]))
				return true;
		}
		
		return false;
	}
}

Polygon.prototype.getVertexCount = function() { return this._points.length; }
Polygon.prototype.getVertex = function(index) { return this._points[index]; }
Polygon.prototype.addVertex = function(p) {
	var d = p.length();
	var n = p.divide(d);

	var a1 = n.dot(Vector2D.X_AXIS);
	var a2 = n.dot(Vector2D.Y_AXIS);


	var a = a2 >= 0 ? Math.acos(a1) : 2 * Math.PI - Math.acos(a1);

	this._startingAngles.push(a);
	this._distances.push(d);
	this._points.push(p);
}

Polygon.prototype.reset = function() {
	this.setPosition(Vector2D.ZERO);
	this.setRotation(0);
	return this;
}

Polygon.prototype.setPosition = function(v) {
	this._position.set(v);
	return this;
}

Polygon.prototype.translate = function(v) { 
	this._position.setAdd(v);
	return this;
}

Polygon.prototype.rotate = function(a) { 
	this._angle += a;
	return this;
}

Polygon.prototype.scale = function(factor) {
	for(var i = 0; i < this._distances.length; i++) {
		this._distances[i] *= factor;
	}
	return this;
}

Polygon.prototype.setRotation = function(a) {
	this._angle = a;
	return this;
}

Polygon.prototype.update = function() {
	var xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE,
		xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;

	for(var i = 0; i < this._points.length; i++) {
		var a = this._startingAngles[i] + this._angle;
		
		this._vec1.setXY(Math.cos(a), Math.sin(a)).setNormalize().setScale(this._distances[i]);
		this._points[i].set(this._position).setAdd(this._vec1);

		xmin = xmin < this._points[i].x ? xmin : this._points[i].x;
		ymin = ymin < this._points[i].y ? ymin : this._points[i].y;
		xmax = xmax > this._points[i].x ? xmax : this._points[i].x;
		ymax = ymax > this._points[i].y ? ymax : this._points[i].y;

	}

	this._boundingBox.x1 = xmin;
	this._boundingBox.y1 = ymin;
	this._boundingBox.x2 = xmax;
	this._boundingBox.y2 = ymax;

	return this;
}

Polygon.prototype.stroke = function(ctx) {
	this._createPath(ctx);
	ctx.stroke();
	return this;
}

Polygon.prototype.fill = function(ctx) {
	this._createPath(ctx);
	ctx.fill();
	return this;
}

Polygon.prototype._createPath = function(ctx) {
	ctx.beginPath();
	ctx.moveTo(this._points[0].x, this._points[0].y)

	for(var i = 1; i < this.getVertexCount(); i++)
		ctx.lineTo(this._points[i].x, this._points[i].y);

	ctx.closePath();
}

Polygon.prototype.project = function(axis) {
	return this._project(axis, new Interval());
}

Polygon.prototype._project = function(axis, result) {
	var pts = this._points;
	var min = Number.MAX_VALUE, max = Number.MIN_VALUE;
	for(var i = 0; i < pts.length; i++) {
		var val = pts[i].dot(axis);
		min = val < min ? val : min;
		max = val > max ? val : max;	
	}

	result.a = min;
	result.b = max;
}

RegularPolygon = function(numVertices, radius) {
	Polygon.call(this);

	var step = Math.PI * 2 / numVertices;

	for(var i = 0; i < numVertices; i++) {
		var angle = step * i;
		var vertex = new Vector2D(Math.cos(angle), Math.sin(angle)).normalize().scale(radius);
		this.addVertex(vertex);
	}
}

RegularPolygon.prototype = Object.create(Polygon.prototype);
RegularPolygon.prototype.constructor = RegularPolygon;