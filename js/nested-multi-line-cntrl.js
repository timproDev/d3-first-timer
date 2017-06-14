function multiLine() {
	var settings = {	
		chartContainerClass: ".g-chart-container-multi-line",
		selectedRegion : "global",
		selectedCoverage : "Insurance Market Index",
		chartType : "line", // options: bar, line
		tickCount : "8",	
		breakout: "single", // options: single, multi,
		filterHeaders: ["global","misc"] // remove unrelated data from set
	};

	var chartContainer = d3.select(settings.chartContainerClass).html("");

	var margin = {
			top:80,
			left:40,
			right:40,
			bottom:80
		};

	var w = chartContainer.node().clientWidth - margin.left - margin.right,
			h = 400 - margin.top - margin.bottom;

	d3.queue()
		.defer(d3.csv, "data/gimi-update.csv")
		.await(ready);

	function ready(error, data) {
		if (error) throw "error: not loading data, bro";

		// remove unwanted data
		data = data.filter(function(d){
			return d.region !== settings.filterHeaders[0] && d.region !== settings.filterHeaders[1]
			&& d.coverage !== "Cyber Liability Insurance Renewal Rate";
		});

		// [+] Parse data
		data.forEach(function(d){
			d.value = parseFloat(d.value);
			d.qYear = d.quarter + " " + d.year;
		});	
		
		var dbRegion = data.filter(function(d){
			return d.region === "us";
		});
			
	  var dbRegionAndCoverage = d3.nest()  	
			.key(function(d) { return d.coverage; })			
			.entries(dbRegion);		

		// [+] interaction UI - buttons, select, text field, etc...	
		// create array of region text
		var regionsArray = data.map(function(d){
			return d.region;
		});	
		regionsArray = d3.set(regionsArray).values();	

		// [+] generators and functions - scales, axis, lines, etc...
		var xscale = d3.scalePoint()
			.domain(dbRegion.map(function(d) { return d.qYear; }))
			.range([0,w-20]);

		var yscale = d3.scaleLinear()
			.domain([-15,15])
			.range([h,0]);

		var xaxis = d3.axisBottom()		
			.scale(xscale);

		var yaxis = d3.axisRight()
			.scale(yscale)
			.ticks(3)
			.tickFormat(d3.format(""))
			.tickSize(w);	

		var lineGen2 = d3.line()
			.x( function(d){ return xscale(d.qYear); })
			.y( function(d){ return yscale(d.value); });	
		
		var btnWrap = chartContainer.append("div.btn-wrap");
		var button = btnWrap // data join for buttons
			.selectAll(".userButton")
			.data(regionsArray)
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

		// append divs and join data
		var divs = chartContainer.selectAll(".cov-div")
			.data(dbRegionAndCoverage)
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
			.translate([margin.left, 0]);

		// append axis
		covSvg.append("g.x-axis")
			.call(xaxis)
			.translate([0,h]);
		
		// append axis
		covSvg.append("g.y-axis")
			.call(yaxis);
		
		// append path - pass line generator
		covSvg
			.append("path.cov-path")
			.attr("d", function(d){			
				return lineGen2(d.values);
			});

		// append circles
		covSvg
			.selectAll(".cov-dot")
			.data(function(d){
				return d.values;
			})
			.enter()		
			.append("circle.cov-dot")
			.attr("r",5)
			.attr("cx",function(d){
				return xscale(d.qYear);
			})
			.attr("cy",function(d){
				return yscale(d.value);
			});


		// [+] Update Function
	    function updateLine(region) {        

	    	// [+] Pass new data and filter
	        var updatedData = data.filter(function(d){
	            return d.region === region;
	        });            

	        var updatedNest = d3.nest()      
	            .key(function(d) { return d.coverage; })            
	            .entries(updatedData);
	        
	        // [+] ENTER
	        var xscale = d3.scalePoint()
	            .domain(updatedData.map(function(d) { return d.qYear; }))
	            .range([0,w-20]);

	        var yscale = d3.scaleLinear()
	            .domain([-15,15])
	            .range([h,0]);        

	        var lineGen2 = d3.line()
	            .x( function(d){ return xscale(d.qYear); })
	            .y( function(d){ return yscale(d.value); });

	        var updivs = chartContainer.selectAll(".cov-div")
	            .data(updatedNest);

	        var updots = updivs
	            .selectAll(".cov-dot")
	            .data(function(d){
	                return d.values;
	            });

	        var uptitle = updivs
						.selectAll("h2.title");	

	        // [+] EXIT
	        updivs
	            .select(".cov-path")
	            .transition().duration(600)
	            // .style("stroke", "red")
	            .attr("d", function(d){
	                return lineGen2(d.values);
	            });        

	        updots
	            .exit()
	            .transition()
	            .remove();

	        // [+] Update
	        updots
	            .transition().duration(600)
	            .attr("class","cov-dot")        
	            .attr("r",5)
	            .attr("cx",function(d){                
	                return xscale(d.qYear);
	            })
	            .attr("cy",function(d){
	                return yscale(d.value);
	            });
	    }
	}
}