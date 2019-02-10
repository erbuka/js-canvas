Random = {
	_shuffleData : {},
	getShuffleData : function(size) {
		if(this._shuffleData[size] === undefined) {
			var ordered = [];
			for(var i = 0; i < size; i++) {
				ordered.push(i);
			}


			var shuffled = [];
			while(ordered.length > 0) {
				var i = Math.floor(Math.random() * ordered.length);
				shuffled.push(ordered[i]);
				ordered.splice(i, 1);
			}

			this._shuffleData[size] = shuffled;
		} 

		return this._shuffleData[size];
	},
	shuffleByteArray : function(array) {
		var sd = this.getShuffleData(array.length);
		var result = new Uint8Array(array.length);
		for(var i = 0; i < result.length; i++) {
			result[i] = array[sd[i]];
		}
		return result;
	}
}