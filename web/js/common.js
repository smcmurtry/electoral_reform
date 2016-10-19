// var page_w = 900;
var page_w = +d3.select('#main').style('width').slice(0,-2);

var voting_systems = [
  {label: 'First Past the Post', abbr: 'FPTP'},
  {label: 'Alternative Vote', abbr: 'IRV'},
  {label: 'Dual Member Proportional', abbr: 'DMP'},
  {label: 'Mixed Member Proportional', abbr: 'MMP'},
  {label: 'Single Transferable Vote', abbr: 'STV'}
];

var provs = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
var parties = ['Liberal', 'Conservative', 'NDP', 'Bloc', 'Green', 'Other'];

var regions = [
  {label: 'Canada', 'abbr': 'Canada'},
  {label: 'British Columbia', 'abbr': 'BC'},
  {label: 'Alberta', 'abbr': 'AB'},
  {label: 'Saskatchewan', 'abbr': 'SK'},
  {label: 'Manitoba', 'abbr': 'MB'},
  {label: 'Ontario', 'abbr': 'ON'},
  {label: 'Quebec', 'abbr': 'QC'},
  {label: 'New Brunswick', 'abbr': 'NB'},
  {label: 'Nova Scotia', 'abbr': 'NS'},
  {label: 'Prince Edward Island', 'abbr': 'PE'},
  {label: 'Newfoundland and Labrador', 'abbr': 'NL'},
  {label: 'Yukon', 'abbr': 'YT'},
  {label: 'Northwest Territories', 'abbr': 'NT'},
  {label: 'Nunavut', 'abbr': 'NU'}
];

function create_dropdown(id, data_list) {
  var sel = d3.select(id)
    .selectAll('option')
    .data(data_list)
    .enter()
    .append('option')
    .attr('value', function(d, i) { return i; })
    .html(function(d) { return d.label; });
}

function get_selected_row(id, data_list) {
  if (data_list.length > 0) {
    var selected_row_index = d3.select(id + " option:checked").attr('value')
    var selected_row = data_list[selected_row_index].abbr;
    return selected_row;
  } else {
    return null;
  }
}

function create_g(id, width, height, margin) {

  return d3.select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr('class', 'top')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

function draw_legend(id, entries, width, block_dim, block_padding) {

  var svg_w = block_dim+block_padding,
      svg_h = block_dim+block_padding;

  var legend_div = d3.select(id + ' .legend');
  legend_div.style('width', width + 'px');

  entries.forEach(function(d, i) {
    var entry = legend_div.append('div')
      .attr('class', 'entries')
      .style('position', 'relative')
      .style('float', 'left')
      // .style('width', width + 'px')
      .style('margin-bottom', '5px')

    entry.append('div')
      .attr('class', 'text')
      // .style('width', (width - svg_w - 5) + 'px')
      .style('padding-left', (svg_w + 5) + 'px')
      .style('size', block_dim + 'px')
      .style('line-height', (block_dim+block_padding) + 'px')
      .html(d.label);

    var g = entry.append('div')
      .style('position', 'absolute')
      .style('width', svg_w + 'px')
      .style('top', '0px')
      .attr('class', 'swatch')
      .append('svg')
      .attr('width', svg_w)
      .attr('height', svg_h)
      .append('g')

    if (d.type == 'mp') {
      g.append('rect')
      .attr('x', 0.5*block_padding)
      .attr('width', block_dim)
      .attr('y', 0.5*block_padding)
      .attr('height', block_dim)
      .attr('class', d.type + ' ' + d.class);

    } else if (d.type == 'riding-border') {
      g.append('rect')
      .attr('x', 0.25*block_padding)
      .attr('width', block_dim + 0.5*block_padding)
      .attr('y', 0.25*block_padding)
      .attr('height', block_dim + 0.5*block_padding)
      .attr('class', d.type + ' ' + d.class);
    }
  })
}

// from: http://stackoverflow.com/questions/25405359/how-can-i-select-last-child-in-d3-js
d3.selection.prototype.first = function() {
  return d3.select(this[0][0]);
};
d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
};
