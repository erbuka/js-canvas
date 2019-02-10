Browser = {
	this.IE = "ie",
	this.Chrome = "chrome",
	this.Firefox = "firefox",
	this.Other = "other",
	this.detect = function() {
		if(navigator.userAgent.indexOf("MSIE") > 0)
			return this.IE;
		else if(navigator.userAgent.indexOf("Firefox") > 0)
			return this.Firefox;
		else if(navigator.userAgent.indexOf("Chrome") > 0)
			return this.Chrome;
		else
			return this.Other;
	}
}