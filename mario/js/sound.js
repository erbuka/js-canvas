SoundEngine = function(numChannels) {

	this._soundBank =  {};
	this._numChannels = numChannels;
	this._channels = [];

	if(navigator.userAgent.indexOf("MSIE") > 0)
		this._browser = "ie";
	else if(navigator.userAgent.indexOf("Firefox") > 0)
		this._browser = "firefox";
	else if(navigator.userAgent.indexOf("Chrome") > 0)
		this._browser = "chrome";
	else
		this._browser = "other";

	for(var i = 0; i < numChannels; i++) {
		var ch = new Audio();
		ch.busy = false;
		ch.addEventListener("ended", function() { 
			if(this.loop == false)
				this.busy = false; 
		});
		this._channels[i] = ch;
	}
}

SoundEngine.prototype.getChannel = function(channel) { return this._channels[channel];}
SoundEngine.prototype.getChannelCount = function() { return this._numChannels; }
SoundEngine.prototype.isChannelBusy = function(index) { 
	return this._channels[index].busy;
}
SoundEngine.prototype.loadSound = function(id, src) {
	var audio = new Audio();

	if(src instanceof Audio) {
	
		this._soundBank[id] = src;
	
	} else if(typeof src == "string") {
		
		audio.src = src;
		this._soundBank[id] = audio;
	
	} else {
		
		if(src.ie && this._browser == "ie") {
			audio.src = src.ie;
		} else if(src.firefox && this._browser == "firefox") {
			audio.src = src.firefox;
		} else if(src.chrome && this._browser == "chrome") {
			audio.src = src.chrome;
			
		} else if(src.other) {
			audio.src = src.other;
		}

		this._soundBank[id] = audio;
	}
}


SoundEngine.prototype.stop = function(channel) {
	if(this._channels[channel].busy) {
		this._channels[channel].pause();
		this._channels[channel].busy = false;
	}
}

SoundEngine.prototype.togglePause = function(channel) {
	var ch = this._channels[channel];
	if(ch.busy) {
		if(!ch.paused)
			ch.pause();
		else
			ch.play();
	}
}

SoundEngine.prototype.play = function(id) {
	for(var i = 0; i < this.getChannelCount(); i++) {
		if(!this.isChannelBusy(i)) {
			this._channels[i].src = this._soundBank[id].src;
			this._channels[i].loop = false;
			this._channels[i].busy = true;
			this._channels[i].play();
			return i;
		}
	}

	return -1;
}

