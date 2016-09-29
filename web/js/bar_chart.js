var bars = function() {

  var margin = {top: 20, right: 0, bottom: 0, left: 0},
      width = page_w - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom,
      bar_h = 30,
      bar_padding = 8;

  var x = d3.scale.linear()
    .domain([0, 1.])
    .range([0, width]);

  var g1 = create_g('#bar-chart-1', width, height, margin);
  var g2 = create_g('#bar-chart-2', width, height, margin);
  d3.select('#bar-chart-1').style('position', 'relative').style('top', (-margin.top) + 'px');
  d3.select('#bar-chart-2').style('position', 'relative').style('top', (-margin.top) + 'px');

  function type(d) {
    d['value'] = +d['value'];
    return d;
  }

  function init(error, data) {
    var legend_entries = [
      {label: 'Liberal', class: 'Liberal', type: 'mp'},
      {label: 'Conservative', class: 'Conservative', type: 'mp'},
      {label: 'NDP', class: 'NDP', type: 'mp'},
      {label: 'Bloc Québécois', class: 'Bloc', type: 'mp'},
      {label: 'Green', class: 'Green', type: 'mp'},
      {label: 'Other', class: 'Other', type: 'mp'}
    ];

    draw_legend('#section2', legend_entries, width, 0.5*bar_h, 0.5*bar_padding);
  }

  function update(data, sel_system, sel_region) {

    var pop_rows = data.filter(function(d) { return d.voting_system == 'POP'; })
      .filter(function(d) { return d.region == sel_region; })
      .sort(function(a, b) { return b.value - a.value; });

    var x_positions_pop = get_x_positions(pop_rows);

    var bars2 = g2.selectAll('.pop')
      .data(pop_rows, function(d) { return d.party; });
    bars2.enter().append('rect').attr('class', function(d) { return 'pop ' + d.party; });
    bars2.exit().remove();

    bars2.transition(500)
      .attr('height', bar_h)
      .attr('x', function(d) { return x(x_positions_pop[d.party]); })
      .attr('width', function(d) { return x(d.value); })
      .attr('class', function(d) { return 'pop ' + d.party ; });


    var sel_rows = data.filter(function(d) { return d.voting_system == sel_system; })
      .filter(function(d) { return d.region == sel_region; })
      .sort(function(a, b) { return b.value - a.value; });

    var x_positions_sel = get_x_positions(sel_rows);

    var bars = g1.selectAll('.sel')
      .data(sel_rows, function(d) { return d.party; });
    bars.enter().append('rect').attr('class', function(d) { return 'sel ' + d.party; });
    bars.exit().remove();

    bars.transition(500)
      .attr('height', bar_h)
      .attr('x', function(d) { return x(x_positions_sel[d.party]); })
      .attr('width', function(d) { return x(d.value); })
      .attr('class', function(d) { return 'sel ' + d.party; });


    add_labels(g1, sel_rows, x_positions_sel);
    add_labels(g2, pop_rows, x_positions_pop);

    function add_labels(g, rows, x_positions) {

      var labels = g.selectAll('text').data(rows, function(d) { return d.party; });
      labels.enter().append('text');
      labels.exit().remove();

      var text_height = +labels.style('font-size').slice(0,-2);

      labels.attr('y', -0.25*text_height)
        // .style('stroke', 'black')
        .attr('text-anchor', 'end')
        .html(function(d) {
          if (d.value > 0.02) {
            return d3.format('%')(d.value);
          } else {
            return null;
          }})
        .attr('x', function(d) {
          var cx = x(x_positions[d.party]) + x(d.value); //0.5*x(d.value);
          return cx;
        });

    }
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
