function multiPie() {
	// Nested Multi Pie

	var settings = {
		chartContainerClass: ".g-chart-container-multi-pie",	
		selectedRegion : "us",
		selectedCoverage : "Casualty Insurance Renewal Rate",
		selectedYear : "2016",
		focusDate: "q4 2016",	
		chartType : "line", // options: bar, line
		tickCount : "8",	
		breakout: "single" // options: single, multi	
	};

	var chartContainer = d3.select(settings.chartContainerClass);

	var margin = {
			top:80,
			left:50,
			right:50,
			bottom:80
		};

	var w = (chartContainer.node().clientWidth/2 - margin.left - margin.right) - 20,
			h = 430 - margin.top - margin.bottom
			radius = Math.min(w, h)/2;

	var colorArr = ["#ffffe5","#fff7bc","#fee391","#fec44f"];
	var colorArr2 = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3'];

	d3.queue()
		.defer(d3.csv, "data/gimi-update.csv")	
		.await(ready);

	function ready(error, data) {
		if (error) throw "error: not loading";

		data.forEach(function(d){
				d.value = parseFloat(d.value);
				d.qYear = d.quarter + " " + d.year;
			});
		
		data = data.filter(function(d){
			return d.region === settings.selectedRegion &&
				d.year === "2012" &&
				d.coverage !== "Cyber Liability Insurance Renewal Rate";
		});

		var nestedData = d3.nest()
			.key(function(d) { return d.coverage; })
			.entries(data);		

		console.log(nestedData);

		var divs = chartContainer.html("")
			.selectAll(".pie-chart-wrap")		
			.data(nestedData)
			.enter()
			.append("div.pie-chart-wrap")
			.attr("width", w/2 + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)

		divs
			.append("h2.title-pie")
			.text(function(d){
				return "2012 " + d.key;
			});

		var svg = divs
			.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.append("g.wrap")
			.translate([(w + margin.left + margin.right)/2, (h + margin.top + margin.bottom)/2]);		
			
		var color = d3.scaleOrdinal(colorArr2);

		var pie = d3.pie()
			.sort(null)
			.value(function(d) { return d.value; });

		var path = d3.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		var label = d3.arc()
			.outerRadius(radius + 60)
			.innerRadius(radius);

		var innerLabel = d3.arc()
			.outerRadius(radius/2)
			.innerRadius(radius/2);

		var arc = svg.selectAll(".arc")
			.data(function(d){
				return pie(d.values);
			})
			.enter().append("g.arc");		

		arc.append("path")
			.attr("d", path)
			.attr("fill", function(d) { return color(d.data.quarter); });

		arc.append("text.label")
			.attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
			.attr("dy", "0")
			.attr("text-anchor","middle")
			.text(function(d) { return d.data.quarter; });

		arc.append("text.inner-label")
			.attr("transform", function(d) { return "translate(" + innerLabel.centroid(d) + ")"; })
			.attr("dy", "0")
			.attr("text-anchor","middle")
			.text(function(d) { return d.data.value; });

		d3.select('body').selectAppend('div.tooltip');
	  arc.call(d3.attachTooltip)
	  .on('mouseover', function(d){
	      d3.select('.tooltip').html(d.data.quarter + " " + d.data.coverage)
	   });
	}	
}
