var chartContainer = d3.select(".g-chart-container");
var margin = {
    top:40,
    left:40,
    right:40,
    bottom:40
  };
var w = 600 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var radius = Math.min(w, h) / 2;        
var barWidth = 20;
var gutter = 30;

var sliceSizeColumn = "population";
var colorColumn = "religion";

var svg = chartContainer
  .append("svg")
  .attr("width",  w)
  .attr("height", h);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var pieG = g.append("g");

var angleScale = d3.scaleLinear()
  .range([0, Math.PI]);

var pie = d3.pie();
var arc = d3.arc();

d3.queue()
  .defer(d3.csv, "data/religions.csv")
  .defer(d3.csv, "data/prm.csv")
  .await(ready);

function ready(error, data, prm){
  if (error) throw "error: not loading data, bro";
  
  prm.forEach(function(d){
    d.value = parseFloat(d.value);
  }); 
  
  var regionUS = prm.filter(function(d){
    return d.region == "us" && d.index !== "pris" && d.index !== "eris";
  });  

  console.log(regionUS,data);
  
  data.forEach(function(d){
    d.population = +d.population;
  });        

  pie.value(function(d) { return d.value; });

  angleScale
    .domain([0, d3.max(regionUS, function (d){ return d.value; })]);    

  var pieData = pie(regionUS);

  pieData.forEach(function (d){
    d.startAngle = 0;
    d.endAngle = angleScale(d.value);
  });
  
  g.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

  var slices = g.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
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
    .style("fill", "#f0f")    
    .style("stroke","#ffffff");

    slices.exit().remove();
}