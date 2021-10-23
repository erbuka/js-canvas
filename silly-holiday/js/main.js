(function () {


    let canvas,
        ctx;


    const colors = [
        "#E50088",
        "#E1007A",
        "#DD006C",
        "#D9005F",
        "#D50051",
        "#D20144",
        "#CE0136",
        "#CA0128",
        "#C6011B",
        "#C2010D",
        "#BF0200",
    ];

    let n = 10,
        c = 0,
        col = 0,
        i = 0;

    var size = 360,
        r = size / 2;

    var start = function () {
        prevTime = Date.now();
        loop();
    }

    var loop = function () {


        window.requestAnimationFrame(loop);




        ctx.strokeStyle = colors[col];;

        var t0 = c / n * 2 * Math.PI + i * Math.PI / 180;
        var t1 = ((c * 2) % n) / n * 2 * Math.PI + i * Math.PI / 180;

        var x0 = r * Math.cos(t0);
        var y0 = r * Math.sin(t0);

        var x1 = r * Math.cos(t1);
        var y1 = r * Math.sin(t1);

        ctx.beginPath();
        {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
        }
        ctx.stroke();

        c = (c + 1) % n;

        if (c == 0) {
            i++;
            n = Math.min(100, n * 2);
            col = (col + 1) % colors.length;
        }
    }



    window.addEventListener("load", function () {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        canvas.width = canvas.height = size;

        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 5;

        ctx.translate(size / 2, size / 2);
        ctx.rotate(Math.PI / 2);

        document.body.appendChild(canvas);

        start();
    });
})();