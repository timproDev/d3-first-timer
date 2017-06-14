function spanChart(){
	// Nested Single Spancart
	var settings = {
		chartContainerClass: ".g-chart-container-bar",
		selectedRegion : "us",
		selectedCoverage : "Casualty Insurance Renewal Rate",
		tickCount : "8",	
		breakout: "single" // options: single, multi
	};

	var chartContainer = d3.select(settings.chartContainerClass);

	var margin = {
			top:80,
			left:40,
			right:40,
			bottom:120
		};
	var w = chartContainer.node().clientWidth - margin.left - margin.right,
			h = 600 - margin.top - margin.bottom;

	d3.queue()
		.defer(d3.csv, "data/gimi-update.csv")
		.await(ready);

	function ready(error, data) {
		if (error) throw "error: not loading data, bro";

		// [+] Parse data
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
		
		nestByCoverage = nestByCoverage.filter(function(d){
			return d.key === settings.selectedCoverage;
		});

		// [+] generators and functions - scales, axis, lines, etc...
		var xscale = d3.scaleBand()
			.rangeRound([0,w])
			.domain(dbRegion.map(function(d) { return d.qYear; }))		
			.paddingInner(0.15);

		var yscale = d3.scaleLinear()
			.domain(d3.extent(dbRegionAndCoverage, function(d){return d.value;}))
			.range([h,0]);		

		var xaxis = d3.axisBottom(xscale);		

		var yaxis = d3.axisRight()
			.scale(yscale)
			.ticks(5)
			.tickFormat(d3.format(""))
			.tickSize(w);						

		// append divs and join data
		var divs = chartContainer.html("").selectAll(".cov-div")
			.data(nestByCoverage)
			.enter()
			.append("div.cov-div");		

		// append title to div
		divs
			.append("h2.title")
			.text(function(d){
				return d.key;			
			});

		// append svg to each div
		var covSvg = divs				
			.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.append("g.wrap")
			.translate([margin.left,margin.top]);

		// append axis
		covSvg.append("g.x-axis")
			.call(xaxis)
			.translate([0,h+50]);
		
		// append axis
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
				var mathMax = yscale(Math.max(0, d.value));
				return mathMax;
			})
			.attr("width",xscale.bandwidth())
			.attr("height",function(d){
				var mathAbs = Math.abs(yscale(d.value) - yscale(0));
				return mathAbs;				
			});

		gRects.append("text.bar-label")
			// centering the label
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
		
	}	
}
