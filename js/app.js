$( window ).resize(fireAll);

function fireAll() {
	multiLine();
	bubbleChart();
	spanChart();	
	barLineChart();
	radialBars();
	slopeGraph();
	multiPie();
	choroplethMap();
}

// pageload fire
;(function(){
	console.log("D3 document is ready!");

	multiLine();
	bubbleChart();
	spanChart();	
	barLineChart();
	radialBars();
	slopeGraph();
	multiPie();
	choroplethMap();

})()
