Level = Class.extend({
	init : function(size) {
		this.size = size;
		this.values = [];
		for(var i = 0; i < size * size; i++) {
			this.values[i] = 0;
		}
	},
	set : function(x, y, val) {
		this.values[x * this.size + y] = val;
	},
	get : function(x, y) {
		return this.values[x * this.size + y];
	}
}, "Level");
