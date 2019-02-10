window._defines = {};


window.define = function(def) {
	if(window._defines[def])
		console.error("Already defined: " + def);
	else
		window._defines[def] = true;
}

window.require = function(def) {
	if(!window._defines[def])
		console.error("Require: " + def);
}