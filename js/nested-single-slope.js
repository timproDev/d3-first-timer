function slopeGraph() {
	var settings = {
	chartContainerClass: ".g-chart-container-slopegraph",
	selectedRegion : "us",
	selectedCoverage : "Casualty Insurance Renewal Rate",
	slopeStart: "q4 2016",
	slopeEnd: "q1 2017",
	chartType : "line", // options: bar, line
	tickCount : "8",	
	breakout: "single" // options: single, multi
};

var chartContainer = d3.select(settings.chartContainerClass);

var margin = {
		top:80,
		left:40,
		right:40,
		bottom:80
	};

var w = chartContainer.node().clientWidth - margin.left - margin.right,
	h = 600 - margin.top - margin.bottom;

d3.queue()
	.defer(d3.csv, "data/gimi-update.csv")
	.await(ready);

function ready(error, data) {
	if (error) throw "error: not loading data, bro";
		
		data.forEach(function(d){
			d.value = parseFloat(d.value);
			d.qYear = d.quarter + " " + d.year;
		});	
		
		// initial data point
		var dbRegion = data.filter(function(d){
			return d.region === settings.selectedRegion;
		});
		var dbRegionAndCoverage = data.filter(function(d){
			return d.region === settings.selectedRegion && d.coverage === settings.selectedCoverage;
		});		
		var dbSlopeRange = dbRegionAndCoverage.filter(function(d){		
			return (d.qYear === settings.slopeStart) || (d.qYear === settings.slopeEnd);
		});

		// powered by multiple keys		
	  var nestByCoverage = d3.nest()  	
			.key(function(d) { return d.coverage; })			
			.entries(dbRegion);		

		// for single chart, filter by key
		nestByCoverage = nestByCoverage.filter(function(d){
			return d.key === settings.selectedCoverage;
		});	

		var divs = chartContainer.html("").selectAll(".cov-div")
			.data(nestByCoverage)
			.enter()
			.append("div.cov-div");			

		// append title to div
		divs
			.append("h2.title")
			.text(function(d){
				return (settings.selectedRegion).toUpperCase() + " " + d.key;
			});

		var svg = divs				
			.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.append("g.wrap")			
			.translate([margin.left,margin.top]);

		var xscale = d3.scalePoint()
			.domain(dbSlopeRange.map(function(d) { return d.qYear; }))
			.range([0,w]);
				
		var yscale = d3.scaleLinear()
				.domain(d3.extent(dbRegionAndCoverage, function(d){return d.value;}))
				.nice()
				.range([h,0]);
		
		var xaxis = d3.axisBottom()	
			.tickSize(-h)
			.scale(xscale);
		
		var yaxis = d3.axisRight()
				.scale(yscale)
				.ticks(settings.tickCount)						
				.tickFormat(d3.format(""))
				.tickSize(w);	

		var lineGen2 = d3.line()
				.x( function(d){ return xscale(d.qYear); })
				.y( function(d){ return yscale(d.value); });

		svg.append("g.x-axis")
			.call(xaxis)
			.translate([0,h]);

		svg.append("g.y-axis")
			.call(yaxis);

		d3.selectAll(".tick").each(function() {
			  if(+this.textContent == 0) {
			  	this.classList.add("zilch");
			  }
			});
		
		svg.append("path.coverage-slope")
			.attr("d", lineGen2(dbSlopeRange));

		svg
			.selectAll(".g-dots-slope")
			.data(dbSlopeRange)
			.enter()
			.append("circle.g-dots-slope")
			.attr("r",6)
			.attr("cx",function(d){ 
				return xscale(d.qYear);
			})
			.attr("cy",function(d){ 
				return yscale(d.value);
			});

		// within ready function
		function updateLine(coverage) {
			// reset the data	
			newData.forEach(function(d){
				d.coverage = parseFloat(d.values[0][coverage]);
			});			
			
			covData = newData.filter(function(d){
				// && will always return false - use or
				return (d.key == "Q4 2016") || (d.key == "Q1 2017");
			});
			
			var yscale = d3.scaleLinear()
				.domain([-5,5])				
				.nice()
				.range([h,0]);

			yaxis.scale(yscale);
			svg.select(".y-axis")
				.transition().duration(600)
				.call(yaxis);

			var updateDots = svg.selectAll(".g-dots-slope")
				.data(covData);
			
			var updateLine = svg.selectAll(".coverage-slope")
				.data(covData);

			var lineGen2 = d3.line()
				// .curve(d3.curveCardinal)
				.x( function(d){ return xscale(d.key); })
				.y( function(d){ return yscale(d.coverage); });

			updateDots
				.exit()
				.transition()				
				.remove();

			updateLine
				.exit()
				.transition()				
				.remove();
			
			updateDots
				.transition().duration(600)
				.attr("cx",function(d){ 
					return xscale(d.key);
				})
				.attr("cy",function(d){ 
					return yscale(d.coverage);
				});

			updateLine
				.transition().duration(600)
				.attr("d", lineGen2(covData));
		
			updateDots
				.enter()
				.append("circle.g-dots")
				.attr("cx",function(d){ 
					return xscale(d.key);
				})
				.attr("cy",function(d){ 
					return yscale(d.coverage);
				})
				.transition()
				.style("fill","green");

		}
		// update end
	}	
}
