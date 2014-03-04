var response;
var yAxisInput;
$(document).ready(function() {

  $(".dropdown a").click(function(e){
    e.preventDefault();
    yAxisInputPretty = $(this).text();

    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    yAxisInput = yAxisInputPretty.replace(" ", "_").toLowerCase();

    $("h1.graphs").text("Group Campaigns by " + yAxisInputPretty);

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    // remove graph if it exists
    d3.select(".svg svg").remove();

    var svg = d3.select(".svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/group_campaigns/graph/" + yAxisInput + ".json", function(error, data) {
      // returns keys, makes them for side bar
      response = data;
      // grouping each of the bars
      var i = -1;
      var campaignNames = [];
      response.forEach(function(d) {
        i++;
        campaignNames.push(d3.keys(data[i]).filter(function(key) { return key !== "weekday"; }) );
        var ii = -1;
        campaignNames.forEach(function(dd) {
          ii ++;
          response[i].days = campaignNames[ii].map(function(name) {
            return {name: name, value: +response[i][name]};
          });
        });
      });

      // labels for x axis
      x0.domain(response.map(function(d) { return d.weekday; }));
      // divide up the x axis bars
      // var i = -1;
      // campaignNames.forEach(function(d) {
      //   i++;
      //   x1.domain(campaignNames[i]).rangeRoundBands([0, x0.rangeBand()]);
      // });
      x1.domain(campaignNames).rangeRoundBands([-200, 600]);
      // set scale of y axis
      y.domain([0, d3.max(response, function(d) {
        return d3.max(d.days, function(d) { return d.value;})})]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yAxisInputPretty);

      var weekdayX = svg.selectAll(".weekdayX")
          .data(response)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x0(d.weekday) + ",0)"; });

      weekdayX.selectAll("rect")
          .data(function(d) { return d.days; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .attr("class", "group-campaign")
          .style("fill", function(d) { return color(d.name); })
          .on("mouseover", function(d) {
            d3.select()
            svg.append("text")
               .attr("class", "group-campaign-text")
               .attr("transform", function() { return "translate(" + x0(d.weekday) +",-10)"; })
               .attr("x", 610)
               .attr("y", 33)
               .attr("dy", ".35em")
               .style("text-anchor", function() { return x1(d.name); })
               .text(function() { return d.name; }),
            svg.append("text")
               .attr("class", "other-group-campaign-text")
               .attr("transform", function() { return "translate(" + x0(d.weekday) +",-10)"; })
               .attr("x", 610)
               .attr("y", 60)
               .attr("dy", ".35em")
               .style("text-anchor", function() { return x1(d.name); })
               .text(function() {
                if (yAxisInput == "revenue_created") {
                  return "$" + d.value.toFixed(2); 
                };
                return d.value;
              });
          })
          .on("mouseout", function(d) {
            d3.select(".group-campaign-text").remove();
            d3.select(".other-group-campaign-text").remove();
          });

      svg.append("rect")
          .attr("x", 600)
          .attr("y", 20)
          .attr("height", 100)
          .attr("width", 300)
          .attr("fill", "rgba(255,255,255,0.8)")
          .attr("stroke", "#ccc");

      svg.append("text")
          .attr("class", "hovered-label")
          .attr("x", 675)
          .attr("y", 10)
          .attr("dy", ".5em")
          .html("Group Campaign Data");

      // var legend = svg.selectAll(".legend")
      //     .data(campaignNames.slice().reverse())
      //   .enter().append("g")
      //     .attr("class", "legend")
      //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // legend.append("rect")
      //     .attr("x", width - 18)
      //     .attr("width", 18)
      //     .attr("height", 18)
      //     .style("fill", color);

      // legend.append("text")
      //     .attr("x", width - 24)
      //     .attr("y", 9)
      //     .attr("dy", ".35em")
      //     .style("text-anchor", "end")
      //     .text(function(d) { return d; });
    });
  });
});