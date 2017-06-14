function choroplethMap() {
	var margin = {top:40,left:40,right:40,bottom:40};

	var chartContainer = d3.select(".g-chart-container-choro-map").html("");

	var w = chartContainer.node().clientWidth - margin.left - margin.right,
		h = 640 - margin.top - margin.bottom;

	// svg append
	var svg = chartContainer
		.append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.top + margin.bottom)
		.append("g")
		.attr("transform","translate("+ margin.left +"," + margin.top +")");

	// works almost like csv, but handles multiple files
	d3.queue()
		.defer(d3.csv, "data/gunHistory.csv")
		.defer(d3.json, "data/us.json")
		.await(ready);

	function ready(err, data, us) {
		if (err) throw "error: not loading data, bro. you should look into that.";
		
		// reference tool - functional program *!*!*!*!
		var gunsByFips = {};
		data.forEach(function(d){
			gunsByFips[d.FIPS] = +d.count3;
		});
		// transforms topo json file into a d3-readable format
		var counties = topojson.feature(us, us.objects.counties);
		// for states var counties = topojson.feature(us, us.objects.states);

		// path generator / almost like an x and y scale wrapped into one
		var path = d3.geoPath()
			.projection(d3.geoAlbersUsa()
				// fitsize is the default zoom presentation
				.fitSize([w,h], counties));

		// color
		var threshold = d3.scaleThreshold()
			.domain([3, 6, 9, 12, 15])			
	    .range(['#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#99000d']);

		var county = svg.selectAll(".county-path")
			.data(counties.features)
			.enter()
			.append("path")
			.attr("class","county-path")
			.attr("d", function(d){
				return path(d);
			})
			.style("fill", function(d) { return threshold(gunsByFips[d.id]); });
			// .classed("has-guns",function(d){
			// 	// fipstxt in the dataset is equivalent to the id of the county in the json
			// 	var guns = gunsByFips[d.id];
			// 	return guns > 10;
			// });

		var xscale;
		var yscale;
	}	
}
