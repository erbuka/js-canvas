ResourceLoader = function() {
	this._resources = [];
	this._endCallback = null;
}

ResourceLoader.prototype.getResource = function(id) { 
	for(var i = 0; i < this._resources.length; i++) {
		if(this._resources[i].rsId == id)
			return this._resources[i];
	}
	return null;
}

ResourceLoader.prototype.getLoadedCount = function() {
	var count = 0;  
	for(var i = 0; i < this._resources.length; i++)
		if(this._resources[i].rsLoaded)
			count++;

	return count;	
}

ResourceLoader.prototype.getProgress = function() {
	return this.getLoadedCount() / this._resources.length;
}
ResourceLoader.prototype.isDone = function() { return this.getLoadedCount() == this._resources.length; }

ResourceLoader.prototype.startLoading = function(endCallback) {

	if(endCallback)
		this._endCallback = endCallback;

	for(var i = 0; i < this._resources.length; i++) {

		var r = this._resources[i];

		if(r.rsLoaded)
			continue;

		if(r.rsType == "audio") {
			r.addEventListener("canplaythrough", function() {
				this.rsLoaded = true;
				this.rsRef.startLoading();
			});

			r.src = r.rsSrc;
			
			return;

		} else if(r.rsType == "image") {
			r.addEventListener("load", function() {
				this.rsLoaded = true;
				this.rsRef.startLoading();
			});

			r.src = r.rsSrc;
			
			return;

		} else {
			throw "Invalid resource type: " + r.rsType;
		}
	}

	if(this._endCallback)
		this._endCallback();
}

ResourceLoader.prototype.addAll = function(resDescArray)  {
	for(var i = 0; i < resDescArray.length; i++) {
		this.add(resDescArray[i]);
	}
}
ResourceLoader.prototype.add = function(resDesc) {

	if(resDesc.id && resDesc.type && resDesc.src) {
		
		var res = null;

		if(resDesc.type == "audio") {
			res = new Audio();
		} else if(resDesc.type == "image") {
			res = new Image();
		} else {
			throw "Invalid resource type: " + resDesc.type;
		}

		this._initResource(res, resDesc);

		this._resources[this._resources.length] = res;

	}
}

ResourceLoader.prototype._initResource = function(res, resDesc) {
	res.rsRef = this;
	res.rsId = resDesc.id;
	res.rsType = resDesc.type;
	res.rsSrc = resDesc.src;
	res.rsLoaded = false;
}