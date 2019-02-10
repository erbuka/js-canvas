Array.prototype.removeIf = function(predicate)
{
	for(var i = this.length - 1; i >= 0; i--)
	{
		var x = predicate(this[i]);
		if(predicate(this[i]))
		{
			this.splice(i, 1);
		}
	}
}

Array.prototype.maxValue = function(predicate)
{
	var v = -Number.MAX_VALUE;
	for(var i = 0; i < this.length; i++)
	{
		var k = predicate(this[i]);
		v = k > v ? k : v;
	}
	return v;
}

Array.prototype.all = function(predicate)
{
	for(var i = 0; i < this.length; i++)
	{
		if(!predicate(this[i]))
		{
			return false;
		}
	}

	return true;
}

Array.prototype.max = function(predicate)
{
	var result = {
		element : null,
		index : -1,
		value : -Number.MAX_VALUE
	}

	for(var i = 0; i < this.length; i++)
	{
		var k = predicate(this[i]);
		if(k > result.value)
		{
			result.element = this[i];
			result.index = i;
			result.value = k;
		}
	}
	return result;
}

Array.prototype.min = function(predicate)
{
	var result = {
		element : null,
		index : -1,
		value : Number.MAX_VALUE
	}

	for(var i = 0; i < this.length; i++)
	{
		var k = predicate(this[i]);
		if(k < result.value)
		{
			result.element = this[i];
			result.index = i;
			result.value = k;
		}
	}
	return result;
}

Array.prototype.random = function()
{
	return this[Math.floor(Math.random() * this.length)];
}


Math.randomRange = function(min, max)
{
	return min + Math.random() * (max - min);
}

Math.randomVariation = function(maxPercent, value)
{
	return value + Math.randomRange(-1, 1) * (Math.random() * maxPercent * value);
}

Math.lerp = function(a, b, t)
{
	return a * (1 - t) + b * t; 
}

class Range {
	constructor(min, max)
	{
		this.min = min;
		this.max = max;
	}

	random() {
		return Math.randomRange(this.min, this.max);
	}
}


class Vec2 {
	constructor(x, y) 
	{
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	}

	add(v) 
	{
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	sub(v) 
	{
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	times(k)
	{
		this.x *= k;
		this.y *= k;
		return this;
	}

	normalize()
	{
		var l = this.length();
		if(l > 0) {
			this.x /= l;
			this.y /= l;
		}
		else
		{
			this.x = this.y = 0;
		}
		return this;
	}

	perp()
	{
		var x = this.x;
		this.x = -this.y;
		this.y = x;
		return this
	}

	limit(k)
	{
		var l = this.length();
		if(l > k)
		{
			this.normalize().times(k);
		}
		return this;
	}

	clampX(min, max)
	{
		this.x = Math.max(min, Math.min(this.x, max));
		return this;
	}

	clampY(min, max)
	{
		this.y = Math.max(min, Math.min(this.y, max));
		return this;
	}

	invert()
	{
		this.x *= -1;
		this.y *= -1;
		return this;
	}

	dot(v)
	{
		return this.x * v.x + this.y * v.y;
	}

	length()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	squaredLength()
	{
		return this.dot(this);
	}

	copy()
	{
		return new Vec2(this.x, this.y);
	}

	angle()
	{
		return Math.atan2(this.y, this.x);
	}

	moveTowards(target, step)
	{
		var c = target.copy().sub(this);

		if(c.length() > step)
		{
			this.add(c.normalize().times(step));
			return false;
		}
		else
		{
			this.x = target.x;
			this.y = target.y;
			return true;
		}
	}

	set(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	}
}

Vec2.left = new Vec2(-1, 0);
Vec2.right = new Vec2(1, 0);
Vec2.up = new Vec2(0, -1);
Vec2.down = new Vec2(0, 1);

Vec2.directions = [Vec2.left, Vec2.right, Vec2.up, Vec2.down];
