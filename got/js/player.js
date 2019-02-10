Frequency = {
	__f0__ : 440,
	__midiF0__ : 69,
	__a__ : Math.pow(2, 1 / 12),
	fromMIDINote : function(midiNoteNumber) {
		return this.__f0__ * Math.pow(this.__a__, midiNoteNumber - this.__midiF0__);
	}
};

Song = Class.extend({
	init : function() {
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	},
	getFrequencyData : Class.abstract,
	getTimeData : Class.abstract,
	play : Class.abstract
})

MP3Song = Song.extend({
	init : function(buffer) {
		Song.call(this);

		this.analyser = this.audioCtx.createAnalyser();
		this.source = this.audioCtx.createBufferSource()
		this.source.buffer = buffer;
		this.source.connect(this.analyser);

		this.analyser.connect(this.audioCtx.destination);

		this.analyser.fftSize = 2048;

	},
	getTimeData : function() {
		var analyser = this.analyser
		var bufferLength = analyser.frequencyBinCount;
		var buffer = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(buffer);
		return buffer;
	},
	getFrequencyData : function() {
		var analyser = this.analyser
		var bufferLength = analyser.frequencyBinCount;
		var buffer = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(buffer);
		return buffer;
	},
	play : function() {
		this.source.start();
	}
});

MP3Song.load = function(url, callback, progressCallback) {
	var xhr = new XMLHttpRequest();

	xhr.open('GET', url, true);
	xhr.responseType = "arraybuffer";

	xhr.addEventListener("load", function(evt) {
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		audioCtx.decodeAudioData(xhr.response, function(buffer) {
			callback(new MP3Song(buffer));
		});
	});

	if(progressCallback) {
		xhr.addEventListener("progress", function(evt) {
			progressCallback(evt.loaded / evt.total);
		});
	}

	xhr.send();
}

MIDISong = Song.extend({
	init : function(midiXMLNode) {
		Song.call(this);

		var self = this;

		this.tracks = [];
		this.analyser = this.audioCtx.createAnalyser();

		midiXMLNode.find("Track").each(function() {
			var track = new MIDITrack($(this), self);
			var oscillator = self.audioCtx.createOscillator();
			var gain = self.audioCtx.createGain();

			oscillator.type = "square";
			oscillator.connect(gain);

			track.oscillator = oscillator
			track.gain = gain;

			self.tracks.push(track);
		});

		this.mixer = this.__createMixer__();
		this.mixer.connect(this.analyser);
		this.analyser.connect(this.audioCtx.destination);

		this.analyser.fftSize = 2048;

		for(var i = 0; i < this.tracks.length; i++) {
			this.tracks[i].gain.connect(this.mixer);
		}

	},
	getTimeData : function() {
		var analyser = this.analyser
		var bufferLength = analyser.frequencyBinCount;
		var buffer = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(buffer);
		return buffer;
	},
	getFrequencyData : function() {
		var analyser = this.analyser
		var bufferLength = analyser.frequencyBinCount;
		var buffer = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(buffer);
		return buffer;
	},
	play : function() {
		var startTime = this.audioCtx.currentTime + 2;
		for(var i = 1; i < this.tracks.length; i++) {
			this.tracks[i].play(startTime);
		}

	},
	__createMixer__ : function() {
		var processor = this.audioCtx.createScriptProcessor(1024, this.tracks.length, 1);
		processor.onaudioprocess = function(e) {
			var inputBuffer = e.inputBuffer;
			var outputBuffer = e.outputBuffer;
			var outputData = outputBuffer.getChannelData(0);

			for(var sample = 0; sample < outputData.length; sample++) {
				outputData[sample] = 0;
			}

			for(var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
				var inputData = inputBuffer.getChannelData(channel);
				for(var sample = 0; sample < inputData.length; sample++) {
					outputData[sample] += inputData[sample];
				}
			}
		}
		return processor;
	}
});

MIDITrack = Class.extend({
	init : function(trackXMLNode, song) {
		var self = this;
		var events = trackXMLNode.find("Event");

		this.song = song;
		this.notes = [];
		this.playing = false;
		this.oscillator = null;
		this.gain = null;

		events.each(function() {
			var absoluteTimeNode = $(this).find("Absolute");
			var noteOnNode = $(this).find("NoteOn");

			if(absoluteTimeNode.length > 0 && noteOnNode.length > 0) {
				if(parseInt(noteOnNode.attr("Velocity")) > 0) {
					self.notes.push(
						new MIDINote(parseInt(absoluteTimeNode.text()), parseInt(noteOnNode.attr("Note")))
					);
				}
			}

		});
	},
	play : function(startTime) {
		if(!this.playing) {

			var oscillator = this.oscillator;
			var gain = this.gain;
			var analyser = this.analyser;
			var notes = this.notes;

			if(!oscillator) {
				console.log("Oscillator missing");
				return;
			}

			if(!gain) {
				console.log("Gain control missing");
				return;
			}

			this.playing = true;

			for(var i = 0; i < notes.length; i++) {
				var note = notes[i];
				var next = notes[i + 1];
				oscillator.frequency.setTargetAtTime(note.frequency, startTime + note.absoluteTime / 1000, .01);
				gain.gain.setValueAtTime(.2, startTime + note.absoluteTime / 1000);
				if(next) {
					gain.gain.linearRampToValueAtTime(.075, startTime + next.absoluteTime / 1000);
				}
			}

			oscillator.start(startTime);
		}
	}
});

MIDINote = Class.extend({
	init : function(absoluteTime, midiNodeNumber) {
		this.frequency = Frequency.fromMIDINote(midiNodeNumber);
		this.absoluteTime = absoluteTime;
	}
})