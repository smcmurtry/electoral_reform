var bars = function() {

  var margin = {top: 0, right: 160, bottom: 25, left: 60},
      width = page_w - margin.left - margin.right,
      height = 100 - margin.top - margin.bottom,
      bar_h = 30,
      bar_padding = 8;

  var x = d3.scale.linear()
    .domain([0, 1.])
    .range([0, width]);

  var g = d3.select('#svg-chart-2')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function type(d) {
    d['value'] = +d['value'];
    return d;
  }

  function init(error, data) {
    // console.log(data);

    // add titles
    var titles_div = d3.select('#chart2 .titles')
      .style('width', margin.left + 'px')
      .style('position', 'absolute')
      .style('top', '8px' );

    titles_div.append('div').html('Result');
    titles_div.append('div').style('margin-top', '15px').html('Popular Vote');

  }

  function update(data, sel_system, sel_region) {

    var pop_rows = data.filter(function(d) { return d.voting_system == 'POP'; })
      .filter(function(d) { return d.region == sel_region; });

    var x_positions_pop = get_x_positions(pop_rows);

    var bars2 = g.selectAll('.pop').data(pop_rows);
    bars2.enter().append('rect').attr('class', function(d) { return 'pop ' + d.party; });
    bars2.exit().remove();

    bars2.transition(500)
      .attr('height', bar_h)
      .attr('y', bar_h*1.3)
      .attr('x', function(d) { return x(x_positions_pop[d.party]); })
      .attr('width', function(d) { return x(d.value); })
      .attr('class', function(d) { return 'pop ' + d.party ; });


    var sel_rows = data.filter(function(d) { return d.voting_system == sel_system; })
      .filter(function(d) { return d.region == sel_region; });

    var x_positions_sel = get_x_positions(sel_rows);

    var bars = g.selectAll('.sel').data(sel_rows);
    bars.enter().append('rect').attr('class', function(d) { return 'sel ' + d.party; });
    bars.exit().remove();

    bars.transition(500)
      .attr('height', bar_h)
      .attr('x', function(d) { return x(x_positions_sel[d.party]); })
      .attr('width', function(d) { return x(d.value); })
      .attr('class', function(d) { return 'sel ' + d.party; });

  }

  function get_x_positions(rows) {
    var x_positions = {};
    var counter = 0;
    rows.forEach(function(d) {
      x_positions[d.party] = counter;
      counter += d.value;
    });
    return x_positions;
  }

return {
        init: init,
        type: type,
        update: update
    };

}();
