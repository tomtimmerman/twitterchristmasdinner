app.directive('geo', function(d3, topojson, worldmap, locations) {
    return {
        restrict: 'E',
        template: '<div class="geoChart"></div>',
        
        scope: {
        	display: "="
        },
		
        link: function(scope, element, attrs) {

			var ingredientIndex = 0;
			
			// listener, listens for changes in display attribute
	        scope.$watch('display', function() {
	        	ingredientIndex = getIngredientIndex(scope.display.name); // get index
				svg.selectAll('.mappoints').remove(); // remove map points
	        	drawMapPoints(locations[ingredientIndex].locations); // add new map points
	        })

        	//        	 
			var width = 960,
			    height = 400;

			var svg = d3.select(".geoChart").append("svg")
				//.attr("class", "geoChart")
				.attr("width", width)
				.attr("height", height);

			// draw map
			var projection = d3.geo.equirectangular()			
			    .center([0,0])
			    .scale(140)
			    .rotate([0,0]);			

			var path = d3.geo.path()
				.projection(projection);

			var g = svg.append("g");

			// load and display the World
			g.selectAll("path")
				.data(topojson.object(worldmap, worldmap.objects.countries)
				.geometries)
			.enter()
				.append("path")
				.attr("id",  function(d) {return d.id}) // id of country is ISO 3166-1 code of country
				.attr("d", path);




			//
			drawMapPoints(locations[ingredientIndex].locations);


/*
for(var i=0; i<locations.length;i++) {
	var date = new Date(locations[i].time*1000);

console.log(date.toLocaleDateString("en-GB") + "   " + date.toLocaleTimeString("en-GB"));
}
*/




			//
			function drawMapPoints(locationData) {
				// draw circles
		        var c = g.selectAll("circle")
		           .data(locationData)
		           .enter()
		           .append("circle")
		           .attr("class", "mappoints")
		           .attr("cx", function(d) {
		                   //return projection([d.lon, d.lat])[0];
		                   //return projection([d.coords.toString().split(",")[0], d.coords.toString().split(",")[1]])[0];
		                   return projection([d.toString().split(",")[0], d.toString().split(",")[1]])[0];
		           })
		           .attr("cy", function(d) {
		                   //return projection([d.lon, d.lat])[1];
		                   //return projection([d.coords.toString().split(",")[0], d.coords.toString().split(",")[1]])[1];
		                   return projection([d.toString().split(",")[0], d.toString().split(",")[1]])[1];
		           })
		           //.attr("r", 1.5)
		           .attr("r", 0)
		           .style("fill-opacity", 0.3)
		           .style("fill", "#EC5429");


				c.transition()
					.ease("elastic")
					.duration(1000)
					.delay(function(d, i) {
	    				//return i * 50;
	    				return Math.floor((Math.random()*500)+1);
					})
					.attr("r", 2);
			}



			// 
			function getIngredientIndex(name) {
				var index = 0;
				for(var i = 0; i < locations.length; i++) {
					if(locations[i].name == name) {
						index = i;
					}
				}
				return index;
			}



    	}
    }
})