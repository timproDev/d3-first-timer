function bubbleChart(){
 
  var settings = {  
    chartContainerClass: ".g-chart-container-bubble-chart" 
  };
  var chartContainer = d3.select(settings.chartContainerClass);
  var margin = {
      top:10,
      left:10,
      right:10,
      bottom:10
    };

  var w = chartContainer.node().clientWidth - margin.left - margin.right,
      h = 800 - margin.top - margin.bottom;

  var svg = chartContainer.html("")
      .append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g.wrap")
      .translate([margin.left, margin.top]);

  // var format = d3.format(",d");

  var pack = d3.pack()
      .size([w, h])
      .padding(10.5);

  var color = d3.scaleOrdinal(["#ff0000","#ff4747","#ffbdbd"]);
  
  var fontSizer = d3.scaleThreshold()
    .domain([10000,100000,10000000,50000000])
    .range([5, 10, 20, 35, 60]);

  d3.queue()
    .defer(d3.tsv, "data/trumpCab.tsv")
    .await(ready);

  var formatMoney = d3.format(",d");

  function ready(error, data){
    if (error) throw "error: not loading data, bro";

    data.forEach(function(d){
      d.value = +d.min_assets;
    });

    var root = d3.hierarchy({children: data})
        .sum(function(d) { return d.value; });
        // .each(function(d) {});

    var node = svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        // .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.data.cabinet); });    

    node.append("text")
      .text(function(d){
        var name = d.data.name;
        name = name.split(' ').slice(-1).join(' ');
        return name;
      })
      .style("font-size",function(d){
        return d.r/2;
        // return fontSizer(d.value) + "px";
      })
      .attr("class","name")
      .attr("dy","-.45rem");

    node.append("text")
      .text(function(d){
        var money = formatMoney(d.data.value);        
        return "$" + money;
      })
      .style("font-size",function(d){
        return "1rem";
        // return fontSizer(d.value) + "px";
      })
      .attr("class","dollars")
      .attr("dy",".45rem");
    
    // jetpack
    // node
    //   .append('text').tspans(['Multiple', 'lines'], 20);
  };
}

// font-scaling
// color coding
// render last name only
// print dollar values