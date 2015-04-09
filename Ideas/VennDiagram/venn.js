document.addEventListener("DOMContentLoaded", createVenn);
var diagram;

function createVenn(){
    var canvas = document.getElementById("venn-diagram");
    canvas.height = canvas.clientHeight;
    canvas.width  = canvas.clientWidth;
    var ctx = canvas.getContext("2d");
    
    diagram = new VennDiagram(ctx, canvas.width, canvas.height);

    
    /*******************************************\
    *         windows resize event              *
    *********************************************
    * notes:                                    *
    * when resizing, the browser is constantly  *
    * spamming this event, therefore I put a    *
    * timeout on this event                     *
    \*******************************************/
        
    var resizeTimeout;
    window.addEventListener("resize", function(){
        if(!resizeTimeout){
            resizeTimeout = setTimeout(function(){
                canvas.height = canvas.clientHeight;
                canvas.width  = canvas.clientWidth;

                diagram.resize(canvas.width, canvas.height);
            },400);
            resizeTimeout = null;
        }
        
    }, false);
}

function VennDiagram(ctx, width, height){
    this.nrCircles = 3;
    this.canvD = {center:{x: width / 2, y: height / 2}, radius: Math.min(width, height) / 4};
    this.circles = [];
    this.labels  = [];
    
    this.colours = [ {r:255, g:255, b:255,a:0.8}, {r:148,g:0,b:156, a:0.7}, {r:100,g:255,b:255, a:0.5}];

    ctx.fillStyle   = "#fff";
    ctx.strokeStyle = "#fff";

    var current = null, next = null;
    for(var i = 0; i < this.nrCircles; i++){
        if(next == null){ 
            next = new Circle(this.canvD, i, this.nrCircles, this.colours[i % this.colours.length]);
        }
        current = next;
        next = new Circle(this.canvD, (i+1) % this.nrCircles, this.nrCircles, this.colours[(i+1) % this.colours.length]);
        
        this.circles.push(current);
        this.labels.push(current.label.obj);
    }

    if(this.nrCircles > 2) {
        for (var i = 0; i < this.nrCircles; i++) {
            var overLL = new OverlapLabel(this.canvD.center.x, this.canvD.center.y, this.circles[i], this.circles[(i + 1) % this.nrCircles]);
            this.labels.push(overLL);
        }
    }
    
    this.labels.push(new Label(this.canvD.center,"center"));

    this.circles.forEach(function(c){c.draw(ctx);});
    this.labels.forEach(function(l){l.draw(ctx);});

    var circArr = this.circles;
    var labArr  = this.labels;
    setInterval(function(){
        ctx.fillStyle = "#333";
        ctx.fillRect(0,0,width,height);
        
        circArr.forEach(function(c){
            c.angle.added += c.angle.interval;
            c.calc();
            c.draw(ctx);
        });

        labArr.forEach(function(c){
            c.draw(ctx);
        });
    }, 1000/40); // 40 fps
    
    this.resize = function(width, height){
        this.canvD.center.x = width / 2;
        this.canvD.center.y = height / 2;
        this.canvD.radius  = Math.min(width, height) / 4;
    };
    
    function Circle(canvD, nodeNr, nodesTotal, colour){
        this.self   = {x: null, y: null,r:canvD.radius};
        this.canvD  = canvD;
        this.angle  = {base: nodeNr / nodesTotal * 2 * Math.PI, added:0, interval: 0.01};
        this.diff   = {x: null, y: null};
        this.nodeID = String.fromCharCode(65 + (nodeNr%nodesTotal));
        this.label  = {coor:{x:0, y:0}, obj:null, text: "Node"+ this.nodeID};
        this.label.obj = new Label( this.label.coor, this.label.text);
        
        this.calc = function(){
            circ = this;
            
            circ.diff.x = canvD.radius * Math.sin(circ.angle.base + circ.angle.added);
            circ.diff.y = canvD.radius * Math.cos(circ.angle.base + circ.angle.added);

            circ.self.x = canvD.center.x + 0.7 * circ.diff.x;
            circ.self.y = canvD.center.y - 0.7 * circ.diff.y;
            
            circ.label.coor.x = canvD.center.x + circ.diff.x;
            circ.label.coor.y = canvD.center.y - circ.diff.y;
        };

        this.calc();


        this.draw = function(ctx){
            ctx.fillStyle = "rgba("+colour.r + ", " + colour.g + ", " + colour.b + ", " + colour.a + ")";

            var d = this.self;
            ctx.beginPath();
            ctx.arc(d.x, d.y, canvD.radius, 0, 2 * Math.PI);
            ctx.fill();
        };
    }

    function Label(coor,text){
        this.coords = coor;
        
        this.draw = function(ctx){
            ctx.font = "20px 'Source Sans Pro'";
            var width = Math.floor(ctx.measureText(text).width);

            //ctx.fillStyle = "rgba(0,0,0,0.3)";
            //ctx.fillRect(this.coords.x - (width / 2 + 10) , this.coords.y - 15,width+20,40);

            ctx.fillStyle = "#000";
            ctx.fillText(text, this.coords.x - width / 2, this.coords.y + 10 );
        }
    }

    function OverlapLabel(xInit, yInit, circle1, circle2){
        this.coords = {x:xInit, y:yInit};
        this.text = circle1.nodeID + circle2.nodeID;

        this.calc = function(){
            this.coords.x = ((circle1.canvD.center.x+circle1.diff.x*1.3) + (circle2.canvD.center.x+circle2.diff.x*1.3))/2;
            this.coords.y = ((circle1.canvD.center.y-circle1.diff.y*1.3) + (circle2.canvD.center.y-circle2.diff.y*1.3))/2;
        };
        
        this.draw = function(ctx){
            this.calc();
            
            //ctx.font = "20px 'Source Sans Pro'";
            //var width = Math.floor(ctx.measureText(this.text).width);
            
            ctx.fillStyle = "#000";
            ctx.fillText(this.text, this.coords.x, this.coords.y + 10 );
        }
    }
}


 /********************************************************\
 *     Can't properly imagine how this would work         *
 *         you'll have to insert it yourself              *
 \********************************************************/


//function putVennDiagram(data,parentId,args){
//
//}
//
//var args1 = ["byattribute","numberOfApples"] // different set for each existing distinct value of numberOfApples
//var args2 = ["byclass"] // different set for each class
//// make more that make sense if u like
//
//var nodA = { // example
//    id: 1,/*any int*/
//    class_id: 1, // any int
//    attributes: { // possibly empty
//        name : "joe", // key: generic_value
//        numberOfApples : 5
//    }
//}
//var nodB = { // example
//    id: 2,/*any int*/
//    class_id: 2, // any int
//    attributes: { // possibly empty
//        numberOfPears : 8, // key: generic_value
//        numberOfApples : 3
//    }
//}
//var nodC = { // example
//    id: 3,/*any int*/
//    class_id: 1, // any int
//    attributes: { // possibly empty
//        name : "bob", // key: generic_value
//        numberOfApples : 3
//    }
//}
//
//var data = {
//    nodes: [
//        [
//            nodA,
//            nodB,
//            nodC
//        ]
//
//    ]
//}
