define("projectx.Util");

Util = {
	loadFile : function(url, callback) {
		var req = new XMLHttpRequest();

		req.__done = callback;


		req.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				this.__done(this.responseText);
			}
		}

		req.open("GET", url, true);

		req.send();
	},
    drawCenteredImage: function (ctx, img, position) {
        ctx.drawImage(img, position.x - img.width / 2, position.y - img.height / 2)
    }
}