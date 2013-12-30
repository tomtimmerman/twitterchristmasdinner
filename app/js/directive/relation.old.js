app.directive('relation', function(d3, patterns, ingredients) {
    return {
        restrict: 'E',
        template: '<div class="relationChart"></div>',
        link: function(scope, element, attrs) {


        	// init drawing
			var diameter = 960;
			//var diameter = 800;
			var svg = d3.select(".relationChart").append("svg")
				.attr("width", diameter)
				.attr("height", diameter)
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
			drawOverview(root);



			// draws the overview of all ingredients
			function drawOverview(root) {


	        	// 
				var format = d3.format(",d");
				var bubble = d3.layout.pack()
					.sort(null)
					.size([diameter, diameter])
					.padding(1.5);

				// DRAW NODES
				// add node group
				var node = svg.selectAll(".node")
					.data(bubble.nodes(root))
					//.filter(function(d) { return !d.children; }))
					.enter().append("g")
					.attr("id", function(d) { return d.name; })
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.on("click", function(d,i) { 
						selectNode(this, root.children.length, d);
					});

				
				node.append("title")
					.text(function(d) { return d.name + ": " + format(d.value); });
				

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
	        function drawRelationview(self, d) {
	        	var data = {}; // data of the selected node
	        	var maxRadius = d.r; // set seleted node radius as the maximum radius
	        	var maxValue = d.value; // set selected node value as the maximum value
	        	var spokeMargin = 20; // space between the center node and the serounding nodes
	        	var areaSingle = (Math.PI * (maxRadius * maxRadius)) / maxValue; // area of bubble with the value of 1
	        	var selectedSubNode = false; // if function is called from the same function (selected a sub node) this value is true
	        	var maxAnimationLength = 1000;


			    // get data of the selected node
			    for(var i = 0; i < patterns.length; i++) {
			    	if(patterns[i].name === d.name) {
			    		data = patterns[i]; 
			    		
			    		// is subnode
			    		if(maxValue != data.value) { // check if subnode was selected or function is initiated from overview
			    			selectedSubNode = true;
			    			maxValue = data.value; // 
			    			var area = maxValue * areaSingle; // calulate the current area of the circle
			    			maxRadius = Math.sqrt(area/Math.PI); // calculate radius of circle
			    		}

			    		//
			    		var maxChildValue = getMaxChildValue(data); // maximum child value 
			    		var maxChildRadius = Math.sqrt((maxChildValue*areaSingle)/Math.PI); // maximum child radius 
						for(var j = 0; j < data.children.length; j++) { // enrich data of all the children
							// enrich data
							var angle = (360 / data.children.length) * j, // angle of the subnode
								spokeLength = maxRadius + maxChildRadius + spokeMargin; // distance between center of node and center of subnode
							data.children[j].angle = angle;
							data.children[j].color = ingredients.getColor(data.children[j].name); // assign color
							data.children[j].x = (diameter / 2) + spokeLength * Math.cos(Math.PI*angle/180); // calculate x
							data.children[j].y = (diameter / 2) + spokeLength * Math.sin(Math.PI*angle/180); // calculate y
							var area = data.children[j].value * areaSingle; // area of the bubble
							data.children[j].r = Math.sqrt(area/Math.PI); // radius of bubble
						}
			    	}
			    }

			    // wait until animations are finished
			    setTimeout(function(){
			    	// update center node
					var centerNode = svg.select("#" + d.name);
					centerNode.select("circle").transition()
						.ease("elastic")
						.duration(1000)
						.attr("r", function(d) { 
							var r = Math.sqrt((data.value*areaSingle)/Math.PI);
							return r;
						});

					centerNode.select("text").transition()
						.ease("ease")
						.duration(250)
						//.text(function(d) {return data.name + ": " + data.value;})
						.attr("dy", function(d) {return ".3em";});

				    // draw sub nodes
					var node = svg.selectAll(".subnode")
						.data(data.children)
						.enter().append("g")
						.attr("id", function(d) { return d.name; })
						.attr("class", "node subnode")
						.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

					// add circle
					var c = node.append("circle")
						.attr("r", 0)
						.style("fill", function(d) { return d.color; });

					c.transition()
						.ease("elastic")
						.duration(1000)
						.delay(function(d, i) {
		    				//return i * 50;
		    				return i * (maxAnimationLength/data.children.length);
		    				//return Math.floor((Math.random()*500)+1);
						})
						.attr("r", function(d) { return d.r; });

					// add label
					var t = node.append("text")
						.style("text-anchor", "middle")
						//.style("fill", function(d) {return (this.getComputedTextLength() < d.r*2) ? "#fff" : "#000";})
						.style("fill-opacity", 0)
						//.text(function(d) {return d.name + ": " + d.value;})
						.text(function(d) {return d.name;})
						.style("fill", function(d) {return (this.getComputedTextLength()+10 < d.r*2) ? "#fff" : "#a1a1a1";})
						.attr("dy", function(d) {return (this.getComputedTextLength()+10 < d.r*2) ? ".3em" : (d.r + 10)*-1;});

					t.transition()
						.ease("elastic")
						.duration(1000)
						.delay(maxAnimationLength)
						.style("fill-opacity", 1);

					// add line
					var l = svg.selectAll(".connection")
						.data(data.children)
						.enter().append("line")
	                    .attr("class", "connection")
	                    .attr("x1", function(d, i) {
							var angle = (360 / data.children.length) * i
							return (diameter / 2) + maxRadius * Math.cos(Math.PI*angle/180); // calculate x
	                    })
	                    .attr("y1", function(d, i) {
							var angle = (360 / data.children.length) * i
							return (diameter / 2) + maxRadius * Math.sin(Math.PI*angle/180); // calculate y
	                    })
	                    .attr("x2", function(d, i) {
							var angle = (360 / data.children.length) * i
							return (diameter / 2) + maxRadius * Math.cos(Math.PI*angle/180); // calculate x
	                    })
	                    .attr("y2", function(d, i) {
							var angle = (360 / data.children.length) * i
							return (diameter / 2) + maxRadius * Math.sin(Math.PI*angle/180); // calculate y
	                    })
	                    .attr("stroke-width", 2)
	                    .attr("stroke", "#ebebeb");

	                l.transition()
		                .ease("ease")
		                .duration(250)
		                .delay(maxAnimationLength)
	                    .attr("x2", function(d, i) {
							var angle = (360 / data.children.length) * i
				    		var maxChildValue = getMaxChildValue(data); // maximum child value 
				    		var maxChildRadius = Math.sqrt((maxChildValue*areaSingle)/Math.PI); // maximum child radius 
							var spokeLength = maxRadius + maxChildRadius + spokeMargin - d.r; // distance between center of node and center of subnode
							return (diameter / 2) + spokeLength * Math.cos(Math.PI*angle/180); // calculate x
	                    })
	                    .attr("y2", function(d, i) {
							var angle = (360 / data.children.length) * i
				    		var maxChildValue = getMaxChildValue(data); // maximum child value 
				    		var maxChildRadius = Math.sqrt((maxChildValue*areaSingle)/Math.PI); // maximum child radius 
							var spokeLength = maxRadius + maxChildRadius + spokeMargin - d.r; // distance between center of node and center of subnode
							return (diameter / 2) + spokeLength * Math.sin(Math.PI*angle/180); // calculate x
	                    });

					// add back button
					if(!selectedSubNode) { // only add backbutton if the function is called from overview
						var backButton = svg.append("text")
							.style("text-anchor", "left")
							//.style("fill", "#000")
							.text("< back")
							.attr("class", "backbutton")
							.attr("dx", -100)
							.attr("dy", 20);

						backButton.transition()
							.ease("elastic")
							.duration(1000)
							.delay(700)
							.attr("dx", 10);
					}

					// EVENTS
					// add node events
					svg.selectAll(".node")
						.on("click", function(d,i) { 
							svg.selectAll('.connection').remove(); // remove all lines
							if(this === self) {
								// on click center node
								backToOverview(data.children.length);
							} else {
								// on click sub node
								selectNode(this, data.children.length, d);
							}
						});

					// add back button event
					svg.select(".backbutton")
						.on("click", function(d,i) { 
							svg.selectAll('.connection').remove(); // remove all lines
							backToOverview(data.children.length);
						});

			    },300);

	        }


	        // EVENT: hide all nodes and backbutton and call drawOverview()
	        function backToOverview(numberOfChildren) {
				// hide nodes
			    var nodes = d3.selectAll('.node')
			    nodes.select("circle").transition()
					.ease("ease")
					.duration(250)
					.delay(function(d, i) {return i * 50;})
					.attr("r", 0);

				nodes.select("text").transition()
					.ease("ease")
					.duration(250)
					.delay(function(d, i) {return i * 50;})
					.style("fill-opacity", 0);

				// hide back button
				var backButton = d3.select('.backbutton').transition()
					.ease("elastic")
					.duration(1000)
					.delay(600)
					.attr("dx", -100);

				// wait for animations to complete
				setTimeout(function(){
					nodes.remove();
					backButton.remove();
					drawOverview(); // draw overview
				//},700);
				},(numberOfChildren*50)+250);
	        }


	        // EVENT: hide all nodes except the one that is selected, and move selected node to center and call drawRelationview()
	        function selectNode(self, length, itemData) {
				// HIDE NODES
				// mark nodes that need to be removed
			    svg.selectAll('.node')
			    	.attr("class", function(d) { return (this === self) ? "node" : "node remove"; }) 

			    // move selected node to center
			    svg.selectAll('.node').transition()
					.ease("elastic")
					.delay(700)
					.duration(900)
					.attr("transform", function(d) { return (this === self) ? "translate(" + diameter/2 + "," + diameter/2 + ")" : "translate(" + d.x + "," + d.y + ")"; });

				// reset text color for nodes. Text color of selected node need to be #fff
				svg.selectAll('.node').select("text").transition()
					.ease("ease")
					.duration(200)
					.style("fill", "#fff");

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

				// wait for animations to complete
				setTimeout(function(){
					d3.selectAll('.remove').remove(); // remove nodes
					drawRelationview(self, itemData); // redraw detail view
				},750);
	        }


	        // 
	        function getMaxChildValue(data) {
	        	var max = 0;
	        	for(var i = 0; i < data.children.length; i++) {
	        		if(data.children[i].value > max) {
	        			max = data.children[i].value;
	        		}
	        	}
	        	return max;
	        }



    	}
    }
})