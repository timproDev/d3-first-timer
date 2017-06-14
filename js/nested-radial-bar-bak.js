var settings = {
  chartContainerClass: ".g-chart-container",
  selectedRegion : "us",
  selectedCoverage : "Casualty Insurance Renewal Rate",
  slopeStart: "q4 2016",
  slopeEnd: "q1 2017",
  chartType : "line", // options: bar, line
  tickCount : "8",  
  breakout: "single" // options: single, multi
};

var chartContainer = d3.select(settings.chartContainerClass);
var width = 360;
var height = 360;
var radius = Math.min(width, height) / 2;        
var barWidth = 10;
var radiusSpec = {        	
	one:{
		outer:radius,
		inner:radius - barWidth
	},
	two:{
		outer:radius - barWidth*2,
		inner:radius - barWidth*3
	},
	three:{
		outer:radius - barWidth*4,
		inner:radius - barWidth*5
	},
	four:{
		outer:radius - barWidth*6,
		inner:radius - barWidth*7
	}        	
};

var svg = chartContainer
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) + 
    ',' + (height / 2) + ')');

// generators
// BG grey bars
var arcBG = d3.arc()
  .startAngle(0)
	.endAngle(Math.PI*2);

var pathBG = svg          
  .append('path.path-bg')          
  .attr('d', arcBG.innerRadius(radiusSpec.one.inner).outerRadius(radiusSpec.one.outer))
  .style("fill","#f2f2f2");
var pathBGTwo = svg          
  .append('path.path-bg-two')
  .attr('d', arcBG.innerRadius(radiusSpec.two.inner).outerRadius(radiusSpec.two.outer))
  .style("fill","#f2f2f2");
var pathBGThree = svg          
  .append('path.path-bg-three')
  .attr('d', arcBG.innerRadius(radiusSpec.three.inner).outerRadius(radiusSpec.three.outer))
  .style("fill","#f2f2f2");
var pathBGFour = svg          
  .append('path.path-bg-four')
  .attr('d', arcBG.innerRadius(radiusSpec.four.inner).outerRadius(radiusSpec.four.outer))
  .style("fill","#f2f2f2");

d3.queue()
  .defer(d3.csv, "data/prm.csv")
  .await(ready);

function ready(error, data){
  if (error) throw "error: not loading data, bro";  

  var regionUS = data.filter(function(d){
    return d.region == "us";
  });
  var cri = regionUS.filter(function(d){
    return d.index == "cri";
  });
  var ori = regionUS.filter(function(d){
    return d.index == "ori";
  });
  var eril = regionUS.filter(function(d){
    return d.index == "eril";
  });
  var pril = regionUS.filter(function(d){
    return d.index == "pril";
  });
  var arc = d3.arc()
    .startAngle(0)
    .endAngle(function(d){
      var num = 100 /d.value;
      return Math.PI*2/num;
    });
  // generator + append        
  var path = svg.selectAll('.path-one')
    .data(cri)
    .enter()
    .append('path.path-one')
    .attr('d', arc.innerRadius(radiusSpec.one.inner).outerRadius(radiusSpec.one.outer));

  var path2 = svg.selectAll('.path-two')
    .data(ori)
    .enter()
    .append('path.path-two')
    .attr('d', arc.innerRadius(radiusSpec.two.inner).outerRadius(radiusSpec.two.outer));

  var path3 = svg.selectAll('.path-three')
    .data(eril)
    .enter()
    .append('path.path-three')
    .attr('d', arc.innerRadius(radiusSpec.three.inner).outerRadius(radiusSpec.three.outer));

  var path4 = svg.selectAll('.path-four')
    .data(pril)
    .enter()
    .append('path.path-four')
    .attr('d', arc.innerRadius(radiusSpec.four.inner).outerRadius(radiusSpec.four.outer));


  var button = chartContainer.select(".btn-wrap") // data join for buttons
    .selectAll(".userButton")
    .data(["us","uk"])
    .enter()
    .append("button.userButton")
    .text(function(d){
      return d;
    })
    .on("click", function(d){
      button.classed("active", false);
      var dThis = d3.select(this);
      dThis.classed("active", !dThis.classed("active"));
      updateLine(d);
    });


  // within ready function
  function updateLine(region) {
    // reset the data       
    
    var regionUS = data.filter(function(d){
      return d.region == region;
    });
    var cri = regionUS.filter(function(d){
      return d.index == "cri";
    });
    var ori = regionUS.filter(function(d){
      return d.index == "ori";
    });
    var eril = regionUS.filter(function(d){
      return d.index == "eril";
    });
    var pril = regionUS.filter(function(d){
      return d.index == "pril";
    });

    var arc = d3.arc()
    .startAngle(0)
    .endAngle(function(d){
      var num = 100 /d.value;
      return Math.PI*2/num;
    });
    
    var upPath = svg.selectAll('.path-one')
      .data(cri);      

    var upPath2 = svg.selectAll('.path-two')
      .data(ori);      

    var upPath3 = svg.selectAll('.path-three')
      .data(eril);      

    var upPath4 = svg.selectAll('.path-four')
      .data(pril); 
        
    // upPath
    //   .exit()
    //   .transition()       
    //   .remove();
    // upPath2
    //   .exit()
    //   .transition()       
    //   .remove();
    // upPath3
    //   .exit()
    //   .transition()       
    //   .remove();
    // upPath4
    //   .exit()
    //   .transition()       
    //   .remove();

    
    upPath
    .transition().duration(900)
    .attr('d', arc.innerRadius(radiusSpec.one.inner).outerRadius(radiusSpec.one.outer));

    upPath2
    .transition().duration(900)
    .attr('d', arc.innerRadius(radiusSpec.two.inner).outerRadius(radiusSpec.two.outer));

    upPath3
    .transition().duration(900)
    .attr('d', arc.innerRadius(radiusSpec.three.inner).outerRadius(radiusSpec.three.outer));

    upPath4
    .transition().duration(900)
    .attr('d', arc.innerRadius(radiusSpec.four.inner).outerRadius(radiusSpec.four.outer));
  


    }
    // update end
};
