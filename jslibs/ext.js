/* Math functions & Random numbers generation */

Math.randInt = function(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

Math.randFloat = function(min, max) {
	return Math.random() * (max - min) + min;
}

Math.randomArrayElement = function(arr) {
	return arr[Math.randInt(0, arr.length - 1)];
}

Math.sign = function(n) {
	return n / Math.abs(n);
}

Math.clamp = function(val, min, max) {
	return Math.max(min, Math.min(max, val));
}

/* Array utilities */


Object.defineProperty(Array.prototype, "last", {
	value : function() {
		return this[this.length-1];
	}	
});

Object.defineProperty(Array.prototype, "addUnique", {
	value : function(e) {
		for(var i = 0; i < this.length; i++)
			if(this[i] === e)
				return;

		this.push(e);
	}
});

Object.defineProperty(Array.prototype, "compact", {
	value : function() {
		for(var i = 0; i < this.length; i++) {
			if(this[i] === undefined)
				this.splice(i--, 1);
		}
	}	
});

Object.defineProperty(Array.prototype, "clear", {
	value : function() {
		while(this.length > 0)
			this.pop();
	}	
});

Object.defineProperty(Array.prototype, "randomElement", {
	value : function() {
		return this[Math.floor(Math.random() * this.length)]
	}	
});

Object.defineProperty(Array.prototype, "remove", {
	value : function(e) {
		for(var i = 0; i < this.length; i++) {
			if(e === this[i]) {
				this.splice(i, 1);
				return e;
			}
		}
		return null;
	}	
});
