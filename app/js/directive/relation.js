app.directive('relation', function(d3, patterns, ingredients) {
    return {
        restrict: 'E',
        template: '<div class="relationChart"></div>',
        link: function(scope, element, attrs) {
        	// init drawing
			//var diameter = 960;
			//var diameter = 800;
			var width = 960,
				height = 600;

//console.log(element.width());


			var svg = d3.select(".relationChart").append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "bubble");

        	// format root data for d3 pack
        	// d3 pack layout needs an root node that contains all the data
        	var rootChildren = [];
        	for(var i = 0; i < patterns.length; i++) {
        		if(patterns[i].value > 0) { 
        			rootChildren.push({"name": patterns[i].name, "value": patterns[i].value, "color": ingredients.getColor(patterns[i].name), "opacity": 1});
				}
        	}
        	var root = {"name":"root", "children": rootChildren, "color": "#e1e1e1", "opacity": 0}


			// 
			drawBubbleView(root);
			drawLegend();



			// draws the overview of all ingredients
			function drawBubbleView(viewRoot) {
	        	// 
				var format = d3.format(",d");
				var bubble = d3.layout.pack()
					.sort(null)
					.size([width, height])
					.padding(1.5);

				// DRAW NODES
				// add node group
				var node = svg.selectAll(".node")
					.data(bubble.nodes(viewRoot))
					//.filter(function(d) { return !d.children; }))
					.enter().append("g")
					.attr("id", function(d) { return d.name; })
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.on("mouseover", function(d) {
						r = d.r;
						x = d.x;
						y = d.y - (r+10);
						name = d.name;
						popupPadding = 10;
						popupTextWidth = 0;
						// MOUSEOVER EVENT
						var popup = svg.append('g')
							.attr('class', 'popup')
							//.attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
							.attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })

						// add background
						var r = popup.append("rect")
							.attr("width", 100)
							.attr("height", '1.4em')
							.attr('y', -10)
							.attr("rx", 5)
							.attr("ry", 5)
							.style("fill", "#fff")
							.style("stroke", "#565656")
							.style("stroke-width", 2)
							.style("opacity", 0.7);

						// add text
						var t = popup.append("text")
							.style("text-anchor", "middle")
							.style("fill", "#565656")
							.text(function() { return name; })
							//.attr("dy", ".3em");
							.attr("dy", function() {
								popupTextWidth = this.getComputedTextLength();
								return '.3em';
							});


						// position background rectangle
						r
							.attr("width", popupTextWidth + (popupPadding*2))
							.attr('x', (popupTextWidth+(popupPadding*2))/2*-1);
							

					})
					.on("mouseout", function(d) {
						// MOUSEOUT EVENT
						svg.selectAll('.popup').remove(); // remove popup
					})
					.on("click", function(d,i) { 
						// CLICK EVENT
						selectNode(this, d);
					});

				/*
				node.append("title")
					.text(function(d) { return d.name + ": " + format(d.value); });
				*/

				// add circle
				c = node.append("circle")
					.attr("r", 0)
					.style("fill-opacity", function(d) { return d.opacity; })
					.style("fill", function(d) { return d.color; });

				c.transition()
					.ease("elastic")
					.duration(900)
					.delay(function(d, i) {
	    				//return i * 70;
	    				return Math.floor((Math.random()*500)+1);
					})
					.attr("r", function(d) { return d.r; });


				// add label
				t = node.append("text")
					.attr("dy", ".3em")
					.style("text-anchor", "middle")
					.style("fill-opacity", 0)
					.style("fill", "#fff")
					//.text(function(d) { return d.name + ": " + format(d.value); });
					.text(function(d) { return d.name; });

				t.transition()
					.ease("elastic")
					.duration(1000)
					.delay(800)
					//.style("fill-opacity", 1);
					//.style("fill-opacity", function(d) {return (this.getComputedTextLength()+10 < d.r*2) ? 1 : 0;});
					.style("fill-opacity", function(d) {return (this.getComputedTextLength()+10 < d.r*2) ? 1 : this.remove();});

				// remove root node
				svg.selectAll('#root').remove()
			}



	        // 
	        function selectNode(self, itemData) {
	        	hideNodes(self); // hide not selected nodes

				// hide selected node
			    svg.selectAll('.node').select('circle').transition()
					.ease("elastic")
					.delay(700)
					.duration(1000)
					.style('fill-opacity', 0);

			    svg.selectAll('.node').select('text').transition()
					.ease("elastic")
					.delay(600)
					.duration(900)
					.style('fill-opacity', 0);


				// wait for animations to complete
				setTimeout(function(){
					//
					svg.selectAll('.node').remove(); // remove nodes
					svg.selectAll('.charttitle').remove(); // remove title
					svg.selectAll('.popup').remove(); // remove popup

		        	// format root data for d3 pack
		        	// d3 pack layout needs an root node that contains all the data
		        	var itemChildren = getChildren(itemData.name);
		        	var rChildren = [];
		        	for(var i = 0; i < itemChildren.length; i++) {
		        		if(itemChildren[i].value > 0) { 
		        			rChildren.push({"name": itemChildren[i].name, "value": itemChildren[i].value, "color": ingredients.getColor(itemChildren[i].name), "opacity": 1});
						}
		        	}
		        	var subRoot = {"name":"root", "children": rChildren, "color": "#e1e1e1", "opacity": 0}

		        	//
					// add back button
					if(svg.selectAll('.backbutton')[0].length == 0) { // if there is no back button add one
						var backButton = svg.append("text")
							.style("text-anchor", "left")
							//.style("fill", "#000")
							.text("< back to overview")
							.attr("class", "backbutton")
							.attr("dx", -200)
							.attr("dy", 20)
							.on("click", function(d,i) { 
								// CLICK EVENT FOR BACK BUTTON
								hideNodes(self);

								// hide back button
								var backButton = svg.select('.backbutton').transition()
									.ease("elastic")
									.duration(1000)
									.delay(600)
									.attr("dx", -200);

								// wait for animations to complete
								setTimeout(function(){
									svg.selectAll('.node').remove(); // remove nodes
									backButton.remove(); // remove back button
									svg.selectAll('.charttitle').remove(); // remove title
									drawBubbleView(root);
								},900);
								//},(numberOfChildren*50)+250);
							});

						backButton.transition()
							.ease("elastic")
							.duration(1000)
							.delay(700)
							.attr("dx", 10);
					}

					// 
					// add chart title
					var textMargin = 10;
					var prefixLength = 0;
					var suffixLength = 0;
					var nameLength = 0;

					// add title group
					var title = svg.append('g')
						.attr("class", "charttitle")

					var prefix = title.append('text')
						.style("text-anchor", "left")
						.text("tweets about")
						.attr("dx", function() {
							prefixLength = this.getComputedTextLength() + textMargin;
							return 0;
						})
						.attr("dy", 0);

					var name = title.append('text')
						.style("text-anchor", "left")
						.text(itemData.name)
						.attr("fill", ingredients.getColor(itemData.name))
						.attr("font-size", "1.5em")
						.attr("dx", function() {
							nameLength = this.getComputedTextLength() + textMargin;
							return prefixLength;
						})
						.attr("dy", 0);

					var suffix = title.append('text')
						.style("text-anchor", "left")
						.text("also mentioned")
						.attr("dx", function() {
							suffixLength = this.getComputedTextLength();
							return prefixLength + nameLength;
						})
						.attr("dy", 0);

					// position title in the middle
					title.attr("transform", function() { return "translate(" + (width-suffixLength-prefixLength-nameLength)/2 + "," + 20 + ")"; });

		        	// rebuild view
		        	drawBubbleView(subRoot);

				},1000);
	        }



	        // 
	        function hideNodes(self) {
				// mark nodes are not selected
			    svg.selectAll('.node')
			    	.attr("class", function(d) { return (this === self) ? "node" : "node remove"; }) 

				// hide not selected nodes
				var nodes = svg.selectAll('.remove');
			    nodes.select("circle").transition()
					.ease("ease")
					.duration(250)
					.delay(function(d, i) {
	    				//return i * 50;
	    				return Math.floor((Math.random()*500)+1);
					})
					.attr("r", function(d) { return (this === self) ? d.r : 0; });

				nodes.select("text").transition()
					.ease("ease")
					.duration(250)
					.delay(function(d, i) {
	    				//return i * 50;
	    				return Math.floor((Math.random()*500)+1);
					})
					.style("fill-opacity", function(d) { return (this === self) ? 1 : 0; });

	        }



	        //
	        function drawLegend() {
	        	var typeData = ingredients.getTypes(); // get legend data
	        	
	        	// add legend group
	        	var legend = svg.append('g')
	        		.attr("class", "legend")
	        		.attr("transform", function(d, i) { return "translate(" + 10 + "," + (height-(typeData.length*20)) + ")"; });

	        	// add legend item groups
				var type = legend.selectAll(".legenditem")
					.data(typeData)
					.enter().append("g")
					.attr("id", function(d) { return d.type; })
					.attr("class", "legenditem")
					.attr("transform", function(d, i) { return "translate(" + 0 + "," + i*20 + ")"; });

				// add circle
				c = type.append("circle")
					.attr("r", 0)
					.style("fill-opacity", function(d) { return d.opacity; })
					.style("fill", function(d) { return d.color; });

				c.transition()
					.ease("elastic")
					.duration(900)
					.delay(function(d, i) {
	    				return i * 50;
					})
					.attr("r", 5);

				// add label
				t = type.append("text")
					.attr("dx", ".6em")
					.attr("dy", ".3em")
					.style("text-anchor", "left")
					.style("fill-opacity", 0)
					.text(function(d) { return d.type; });

				t.transition()
					.ease("elastic")
					.duration(900)
					.delay(function(d, i) {
	    				return i * 50;
					})
					.style("fill-opacity", 1);

	        }


	        // returns the children of the item
	        function getChildren(name) {
	        	var returnValue = [];
	        	for(var i = 0; i < patterns.length; i++) {
	        		if(patterns[i].name == name) {
	        			returnValue = patterns[i].children;
	        		}
	        	}
	        	return returnValue;
	        }



    	}
    }
})