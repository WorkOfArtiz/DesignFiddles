var s;

var externalData = {
    "graphDataPath":        "resources/graphData.json",
    "graphSettingsPath":    "resources/graphSettings.json",
    "chartsDataPath":       "resources/chartData.json"
}

function animate(type){
    /*
    if(type == "grid"){
        s.graph.nodes().forEach(function(node){
            node.x = node.coordinates.grid.x;
            node.y = node.coordinates.grid.y;
        });
    }
    else if(type == "circ"){
        s.graph.nodes().forEach(function(node){
            node.x = node.coordinates.circ.x;
            node.y = node.coordinates.circ.y;
        });
    }
    */

    sigma.plugins.animate(
        s,
        {
            x: type+'_x',
            y: type+'_y'
        }
    );

    s.refresh();
}

$(document).ready(function () {
    /*********************************************************
     *                  here i render a graph                *
     ********************************************************/

        // the graph renderer object
    s = new sigma('graphContainer');

    // im doing 2 requests here, the 'when' is due to an asynchronous callback
    $.when(
            $.getJSON(externalData.graphDataPath, function (graph) {
                externalData["graphData"] = graph;
            }),
            $.getJSON(externalData.graphSettingsPath, function (settings) {
                externalData["graphSettings"] = settings;
            })
    ).then(function () {
            // adding the nodes
//            externalData.graphData.nodes.forEach(function (node) {
//                s.graph.addNode(node);
//            });

//            // adding the edges
//            externalData.graphData.edges.forEach(function (edge) {
//                s.graph.addEdge(edge);
//            });

            // changing settings
            s.settings(externalData.graphSettings);

            // mass adding
            var node,edge, edgeCounter = 0,nodeCounter = 0;
            var xNodes = 10,yNodes = 10, maxNodes = xNodes*yNodes;
            for(var x=0;x<xNodes;x++){
                for(var y=0;y<yNodes;y++){
                    node = {};
                    edge = {};

                    node["id"] = "associate"+nodeCounter;
                    node["label"] = node.id;

                    // embeddings
                    node["rand_x"] = Math.random()*200;
                    node["rand_y"] = Math.random()*200;
                    node["circ_x"] = 100+100*Math.sin(2*Math.PI*nodeCounter/maxNodes);
                    node["circ_y"] = 100+100*Math.cos(2*Math.PI*nodeCounter/maxNodes);
                    node["grid_x"] = x * 200/xNodes;
                    node["grid_y"] = y * 200/yNodes;


                    node["x"] = node.rand_x;
                    node["y"] = node.rand_y;

                    node["size"] = 1;

                    s.graph.addNode(node);
                    nodeCounter++;

                    // every node will be connected to a random earlier node
                    edge["id"] = "e"+edgeCounter;
                    edge["source"] = node.id;
                    edge["target"] = "associate" + Math.floor(nodeCounter*Math.random());

                    edgeCounter++;
                    s.graph.addEdge(edge);

                    edge = null;
                    node = null;
                }
            }

            // apply
            s.refresh();

            // add events to graphContainer
            document.addEventListener("keydown", function(e){
                var key = String.fromCharCode(e.keyCode);

                if(key == 'R'){animate("rand");}
            },false);

            var graphContainer = document.getElementById("graphContainer");
            graphContainer.onmouseover = function(){animate("grid");};
            graphContainer.onmouseout  = function(){animate("circ");};
    });

    /********************************************************
     *   Now for some statistics on popularity               *
     ********************************************************/
    $.getJSON(externalData.chartsDataPath,  function(dataset){
        externalData["chartData"] = dataset;

        dataset.forEach(function(stance){
            // container
            var div_stances             = document.getElementById("stances");

            // creating new elements
            var div_stance              = document.createElement("div");
            var h3_titleStance          = document.createElement("h3");
            var div_contentsStance      = document.createElement("div");
            var div_chartContainer      = document.createElement("div");
            var canvas_Chart            = document.createElement("canvas");
            var div_textContainer       = document.createElement("div");
            var h3_subTitle             = document.createElement("h3");
            var p_text                  = document.createElement("p");

            // now the filling
            h3_titleStance.innerHTML    = stance.title;
            h3_subTitle.innerHTML       = stance.textTitle;
            p_text.innerHTML            = stance.textContent;

            // assigning classes
            div_stance.className        = "stance";
            div_contentsStance.className= "contents";
            div_chartContainer.className= "chartContainer";
            canvas_Chart.className      = "stanceChart";
            div_textContainer.className = "textContainer";

            // creating tree structure
            div_stances.appendChild(div_stance);
            div_stance.appendChild(h3_titleStance);
            div_stance.appendChild(div_contentsStance);
            div_contentsStance.appendChild(div_chartContainer);
            div_contentsStance.appendChild(div_textContainer);
            div_chartContainer.appendChild(canvas_Chart);
            div_textContainer.appendChild(h3_subTitle);
            div_textContainer.appendChild(p_text);

            // now creating the chart
            var data = [
                {
                    value: stance.chartData.pro,
                    color: "#40F54C",
                    highlight: "#66FA70",
                    label: "Support"
                },
                {
                    value: stance.chartData.neutral,
                    color: "#46BFBD",
                    highlight: "#5AD3D1",
                    label: "Neutral"
                },
                {
                    value: stance.chartData.against,
                    color: "#F7464A",
                    highlight: "#FF5A5E",
                    label: "Against"
                }
            ];

            var arbContext = canvas_Chart.getContext("2d");
            new Chart(arbContext).Doughnut(data, {segmentShowStroke: false});
        })
    });
    /*
    var data = [
        {
            value: 30,
            color: "#40F54C",
            highlight: "#66FA70",
            label: "Support"
        },
        {
            value: 50,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Neutral"
        },
        {
            value: 20,
            color: "#F7464A",
            highlight: "#FF5A5E",
            label: "Against"
        }
    ];




    var arbCanvas = document.getElementById("thingsChart");
    var arbContext = arbCanvas.getContext("2d");
    var arbChart = new Chart(arbContext).Doughnut(data, {segmentShowStroke: false});
    */
    Chart.defaults.global.responsive = true;
    $(window).resize(resize);
    resize();
});

function resize() {
    var stancesCharts = $(".stanceChart"); //document.getElementsByClassName("stanceChart");

    setTimeout(function () {
        resizeStanceCharts(stancesCharts);
    }, 100);
}

function resizeStanceCharts(charts) {
    var parentHeight, canvasHeight;

    for (var i = 0; i < charts.length; i++) {
        charts[i].style.paddingTop = 0 + "px";

        parentHeight = (charts[i].parentNode).parentNode.clientHeight;
        canvasHeight = charts[i].clientHeight;

        var tooSmall = ( parentHeight - canvasHeight) / 2;

        charts[i].style.paddingTop = tooSmall + "px";
    }
}

