function barLineChart() {
	// Nested Single Bars and Lines
	var settings = {
		chartContainerClass: ".g-chart-container-bar-line",
		selectedRegion : "global",
		selectedCoverage : "Insurance Market Index",
		chartType : "bar", // options: bar, line
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

	function ready(error, data, word) {
		if (error) throw "error: not loading data, bro";	
		
		data.forEach(function(d){
			d.value = parseFloat(d.value);
			d.qYear = d.quarter + " " + d.year;
		});	
		
		// filter data object
		var dbRegion = data.filter(function(d){
			return d.region === settings.selectedRegion;
		});
		
		// filter data object
		var dbRegionAndCoverage = data.filter(function(d){
			return d.region === settings.selectedRegion && d.coverage === settings.selectedCoverage;
		});
		
		// nest data
	  	var nestByCoverage = d3.nest()  	
			.key(function(d) { return d.coverage; })			
			.entries(dbRegion);		

		// filter nest data for single
		if (settings.breakout === "single") {
			nestByCoverage = nestByCoverage.filter(function(d){
				return d.key === settings.selectedCoverage;
			});
		} else if (settings.variance === "multi") {
			settings.selectedRegion = "";
			settings.selectedCoverage = "";
			// build out nested structure and input controls, buttons and select
		}

		if (settings.chartType === "bar") {
			var xscale = d3.scaleBand()
				.rangeRound([0,w])
				.domain(dbRegion.map(function(d) { return d.qYear; }))
				.paddingInner(0.15);

			var yscale = d3.scaleLinear()
				.domain([0.85, d3.max(dbRegionAndCoverage, function(d){ return d.value;})])		
				.range([h,0]);

			var xaxis = d3.axisBottom(xscale);
			var yaxis = d3.axisRight()
				.scale(yscale)
				.ticks(settings.tickCount)
				.tickFormat(d3.format(""))
				.tickSize(w);						

			var divs = chartContainer.html("").selectAll(".cov-div")
				.data(nestByCoverage)
				.enter()
				.append("div.cov-div");			

			divs
				.append("h2.title")
				.text(function(d){
					return d.key;			
				});

			var covSvg = divs				
				.append("svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g.wrap")
				.translate([margin.left,margin.top]);

			covSvg.append("g.x-axis")
				.call(xaxis)
				.attr("transform","translate(0," + h + ")");
			
			covSvg.append("g.y-axis")
				.call(yaxis);	

			d3.selectAll(".tick").each(function() {
				  if(+this.textContent == 0) {
				  	this.classList.add("zilch");
				  }
				});

			var gRects = covSvg.selectAll(".g-comp-rect")
				.data(function(d){
					return d.values;
				})
				.enter()
				.append("g.g-comp-rect");			

			gRects
				.append("rect.comp-rect")
				.attr("x",function(d){				
					return xscale(d.qYear);
				})
				.attr("y",function(d){
					return yscale(d.value);
				})
				.attr("width",xscale.bandwidth())
				.attr("height",function(d){
					return h - yscale(d.value);
				});

			gRects.append("text.bar-label")
	      .attr("x", function(d) { return xscale(d.qYear) + xscale.bandwidth()/2; })
	      .attr("y", function(d) { return yscale(d.value); })
	      .attr("dy", function(d){
	      	if(d.value > 0) {	      		
	      		return "-10px";
	      	} else {
	      		return "20px";
	      	}
	      })
	      .attr("text-anchor","middle")
	      .text(function(d) { return d.value; });
		  
		  } else if (settings.chartType === "line"){
		  	
		  	var xscale = d3.scalePoint()
					.domain(dbRegion.map(function(d) { return d.qYear; }))
					.range([0,w-20]);

				var yscale = d3.scaleLinear()
					.domain(d3.extent(dbRegionAndCoverage, function(d){return d.value;}))
					.nice()
					.range([h,0]);

				var xaxis = d3.axisBottom()
					.scale(xscale);

				var yaxis = d3.axisRight()
					.scale(yscale)
					.ticks(settings.tickCount)						
					.tickFormat(d3.format(""))
					.tickSize(w);	

				var lineGen2 = d3.line()
					.x( function(d){ return xscale(d.qYear); })
					.y( function(d){ return yscale(d.value); });

				var divs = chartContainer.selectAll(".cov-div")
					.data(nestByCoverage)
					.enter()
					.append("div.cov-div");

				divs
					.append("h2.title")
					.text(function(d){
						return d.key;			
					});

				var covSvg = divs				
					.append("svg")
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.append("g.wrap")				
					.translate([margin.left,margin.top]);

				covSvg.append("g.x-axis")
					.call(xaxis)				
					.translate([0,h]);
				
				covSvg.append("g.y-axis")
					.call(yaxis);	
				
				covSvg.append("path.cov-path")
					.attr("d", function(d){
						return lineGen2(d.values);
					});

				covSvg
					.selectAll(".cov-dot")
					.data(dbRegion)
					.enter()		
					.append("circle.cov-dot")
					.attr("r",5)
					.attr("cx",function(d){
						return xscale(d.qYear);
					})
					.attr("cy",function(d){
						return yscale(d.value);
					});
		  }
	}



	// function updateLine(region) {

	// var updatedData = data.filter(function(d){
	//   return d.region === region && d.coverage === "Insurance Composite Renewal Rate";
	// });            

	// var xscale = d3.scalePoint()
	//   .domain(updatedData.map(function(d) { return d.qYear; }))
	//   .range([0,w-20]);

	// var yscale = d3.scaleLinear()
	//   .domain(d3.extent(data, function(d){return d.value;}))
	//   .nice()
	//   .range([h,0]);        

	// var updots = svg
	//   .selectAll(".cov-dot")
	//   .data(updatedData);

	// var uplines = svg
	//   .selectAll(".cov-path")
	//   .data(updatedData);

	// var lineGen2 = d3.line()
	//   .x( function(d){ return xscale(d.qYear); })
	//   .y( function(d){ return yscale(d.value); });


	// updots
	//   .exit()
	//   .transition()
	//   .remove();

	// uplines
	//   .exit()
	//   .transition()
	//   .remove();

	// uplines
	// .transition().duration(600)
	// .attr("d", lineGen2(updatedData));

	// updots
	//   .transition().duration(600)
	//   .attr("class","cov-dot")        
	//   .attr("r",5)
	//   .attr("cx",function(d){                
	//       return xscale(d.qYear);
	//   })
	//   .attr("cy",function(d){
	//       return yscale(d.value);
	//   });

	// }
	// update end

}
