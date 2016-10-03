var table = function() {

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = page_w - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;

  var x = d3.scale.linear().domain([0, 1.]).range([0, width]);

  var g = create_g('#table-chart', width, height, margin);

  var legend_entries = [
    {label: 'Liberal', party: 'Liberal', type: 'mp'},
    {label: 'Conservative', party: 'Conservative', type: 'mp'},
    {label: 'NDP', party: 'NDP', type: 'mp'},
    {label: 'Bloc Québécois', party: 'Bloc', type: 'mp'},
    {label: 'Green', party: 'Green', type: 'mp'},
    {label: 'Other', party: 'Other', type: 'mp'},
    {label: 'Total', party: 'Total', type: 'mp'}
  ];
  function init(error, data) {

    var row_h = 35,
        swatch_x1 = 0,//mp_x1 + 60,
        label_x1 = swatch_x1 + 30,
        swatch_h = 0.5*row_h,
        number_x2 = label_x1 + 200, // so the left of the 3 digit # is left aligned
        mp_x1 = number_x2 + 12;

    var rows = g.selectAll('.rows')
      .data(legend_entries)
      .enter()
      .append('g')
      .attr('class', 'rows')
      .attr("transform", function(d, i) { return "translate(0," + ((i+1)*row_h) + ")"; });

    rows.append('text')
      .attr('x', label_x1)
      .html(function(d) { return d.label; });

    rows.append('rect')
      .attr('class', function(d) { return d.party; })
      .attr('x', swatch_x1)
      .attr('y', -swatch_h)
      .attr('width', swatch_h)
      .attr('height', swatch_h);

    rows.append('text')
      .attr('class', 'mp-text')
      .attr('x', mp_x1)
      .html('MPs');

    rows.append('text')
      .style('text-anchor', 'end')
      .attr('x', number_x2)
      .attr('class', 'seats');

    g.append('line')
      .attr('x1', 0)
      .attr('x2', mp_x1 + 40)
      .attr('y1', ((legend_entries.length-0.7)*row_h))
      .attr('y2', ((legend_entries.length-0.7)*row_h))
      .attr('class', 'thing');
  }

  function update(data, sel_system, sel_region) {

    d3.selectAll('.rows .seats')
      .html(function(d) {
        if (d.party == 'Total') {
          var seat_sum = 0;
          legend_entries.slice(0, -1).forEach(function(e) {
            seat_sum +=data[sel_region][sel_system][e.party]
          })
          d.seat_sum = seat_sum;
          return seat_sum;
        }
        d.seat_sum = data[sel_region][sel_system][d.party];
        return data[sel_region][sel_system][d.party];
      });

    d3.selectAll('.mp-text')
      .html(function(d) {
      if (d.seat_sum == 1) {
        return 'MP';
      }
      return 'MPs';
    });

  }

return {
        init: init,
        update: update
    };

}();
