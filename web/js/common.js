var page_w = 900;

var voting_systems = [
  {label: 'First Past the Post', abbr: 'FPTP'},
  {label: 'Dual Member Proportional', abbr: 'DMP'},
  {label: 'Mixed Member Proportional', abbr: 'MMP'},
  {label: 'Instant Runoff Voting', abbr: 'IRV'}];

var provs = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
var parties = ['Liberal', 'Conservative', 'NDP', 'Bloc', 'Green', 'Other'];

var regions = [];
regions.push({label: 'Canada', abbr: 'Canada'});
provs.forEach(function(d) {
  regions.push({label: d, abbr: d});
});

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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}
