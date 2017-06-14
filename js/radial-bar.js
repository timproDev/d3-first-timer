function radialBars(){
  // http://andyshora.com/tweening-shapes-paths-d3-js.html
  // https://jsbin.com/jadufipiwa/edit?html,js,output

  var chartContainer = d3.select(".g-chart-container-radial-bars");
  var margin = {
      top:40,
      left:40,
      right:40,
      bottom:40
    };
  // var w = 600 - margin.left - margin.right,
  var w = chartContainer.node().clientWidth - margin.left - margin.right,
      h = 600 - margin.top - margin.bottom;

  var radius = Math.min(w, h) / 2;        
  var barWidth = 20;
  var gutter = 30;

  var sliceSizeColumn = "population";
  var colorColumn = "religion";

  var svg = chartContainer.html("")
    .append("svg")
    .attr("width",  w)
    .attr("height", h)
    .translate([0,0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var angleScale = d3.scaleLinear()
    .range([0, Math.PI]);

  var pie = d3.pie().sort(null);
  var arc = d3.arc();

  d3.queue()  
    .defer(d3.csv, "data/prm.csv")
    .await(ready);

  function ready(error, data){
    if (error) throw "error: not loading data, bro";
    
    data.forEach(function(d){
      d.value = parseFloat(d.value);
    }); 
    
    var regionUS = data.filter(function(d){
      return d.region == "us" && d.score !== "pris" && d.score !== "eris";
    });
    
    pie.value(function(d) {
      return d.value;
    });

    angleScale
      .domain([0, d3.max(regionUS, function (d){ return d.value; })]);    

    var pieData = pie(regionUS);

    pieData.forEach(function (d){
      d.startAngle = 0;
      d.endAngle = angleScale(d.value);
    });
    
    g.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    var slices = g.selectAll(".data-path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("class",function(d){        
        return "data-path " + d.data.score;
      })
      .attr("d", function (d, i){
        arc
          .innerRadius(function(d){
            var meas = (i+1)*gutter;
            return radius - meas;
          })
          .outerRadius(function(d){          
            var meas = (i+1)*gutter;
            return (radius - meas) + barWidth;
          });
        return arc(d);
      })      
      .style("fill", "#ff4747")    
      .style("stroke","#ffffff");      



  }
}







