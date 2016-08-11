var margin = {top: 10, right: 0, bottom: 25, left: 15},
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    block_dim = 15,
    block_padding = 8,
    n_rows = 6,
    prov_x_padding = 20,
    prov_y_padding = 50,
    voting_systems = ['MMP'];

create_dropdown('#voting-system-dropdown', voting_systems);

var party_colours = {'NDP': '#F78320', 'Conservative': '#263893', 'Liberal': '#D71921',
                     'Green': '#3D9B35', 'Bloc': '#00A7EC', 'Other': 'grey'};

var provs = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];

var g = d3.select('#svg-chart')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var q = queue();
q.defer(d3.csv, './data/mmp_clean.csv', type);
q.await(init);

function init(error, mmp) {

  var _mmp = {};
  provs.forEach(function(d) {
    _mmp[d] = mmp.filter(function(e) { return e.prov_abbr == d; })
                .sort(function(a, b) { return a.region_number - b.region_number; });
  });

  var dataz = {};
  dataz['MMP'] = _mmp;

  var prov_g = g.selectAll('g.prov')
    .data(provs)
    .enter()
    .append('g')
    .attr('class', function(d) { return 'prov ' + d; });

  prov_g.append('text')
    .attr('class', 'prov-label')
    .attr('y', -2*block_padding)
    .attr('x', -0.5*block_padding)
    .html(function(d) { return d; })

  update(dataz);

  d3.selectAll('select').on('change', function() {
    update(dataz);
  });

}

function update(dataz) {

  var sel_system = get_selected_row('#voting-system-dropdown', voting_systems);

  var prov_width = {};
  provs.forEach(function(prov) {

    var regions = Array.from(new Set(dataz[sel_system][prov].map(function(d) { return d.region_number; })));
    var region_g = d3.select('g.prov.' + prov).selectAll('.region').data(regions);
    region_g.exit().remove();

    region_g.enter()
      .append('g')
      .attr('class', function(d) { return 'region r' + d; });

    var region_x_translate = 0;
    regions.forEach(function(region_number, i) {
      var rg = d3.select('g.region.r' + region_number);
      var rows = dataz[sel_system][prov].filter(function(d) { return d.region_number == region_number; });
      var ridings = Array.from(new Set(rows.map(function(d) { return d.riding_number; })));

      var seats_in_region = rows.length;
      var region_n_cols = Math.ceil(seats_in_region/n_rows);
      var region_w = region_n_cols*(block_dim+block_padding) + 2.*block_padding;//1.*block_padding;
      var region_h;
      if (rows.length >= n_rows) {
        region_h = n_rows*(block_dim+block_padding) + 1.*block_padding;
      } else {
        region_h = rows.length*(block_dim+block_padding) + 1.*block_padding;
      }

      rg.append('rect')
        .attr('class', 'region_border')
        .attr('width', region_w)
        .attr('height', region_h)
        .attr('x', -1*block_padding)
        .attr('y', -1*block_padding)

      rg.attr("transform", "translate(" + region_x_translate + "," + 0 + ")" );
      region_x_translate += region_w;

      var local_rows = rows.filter(function(d) { return d.seat_type == 'local'; });
      var regional_rows = rows.filter(function(d) { return d.seat_type == 'regional'; });
      var sorted_rows = local_rows.concat(regional_rows);

      var riding_borders = rg.selectAll('.riding_border').data(local_rows);
      riding_borders.exit().remove();

      riding_borders.enter()
        .append('rect')
        .attr('class', function(d) { return 'riding_border ' + d.riding_number; });

      riding_borders.attr('width', block_dim + 0.5*block_padding)
        .attr('height', block_dim + 0.5*block_padding)
        .attr('x', function(_, i) { return (Math.floor(i/n_rows))*(block_dim+block_padding) - 0.25*block_padding; } )
        .attr('y', function(_, i) { return (i%n_rows)*(block_dim+block_padding) - 0.25*block_padding; })

      var mps = rg.selectAll('.mp').data(sorted_rows);
      mps.exit().remove();
      mps.enter()
        .append('rect')
        .attr('class', function(d) { return 'mp ' + d.riding_number; });

      mps.attr('width', block_dim)
        .attr('height', block_dim)
        .attr('fill', function(d) { return party_colours[d.party]; })
        .attr('x', function(_, i) { return (Math.floor(i*1./n_rows))*(block_dim+block_padding); } )
        .attr('y', function(_, i) { return (i%n_rows)*(block_dim+block_padding)});

    });
    prov_width[prov] = region_x_translate;

  })
  set_provs_translate(provs, dataz, sel_system, prov_width);

}

function set_provs_translate(provs, dataz, sel_system, prov_width) {
  var prov_w = 0;
  var prov_h = 0;

  provs.forEach(function(prov, i) {
    if (i != 0) {
      // prov_w += Math.ceil(dataz[sel_system][provs[i-1]].length*1./n_rows)*(block_dim+block_padding) + prov_x_padding;
      prov_w += prov_width[provs[i-1]] + prov_x_padding;
    }

    if (i == 4) {
      prov_h = n_rows*(block_dim+block_padding) + prov_y_padding;
      prov_w = 0;
    }

    if (i == 5) {
      prov_h = 2*(n_rows*(block_dim+block_padding) + prov_y_padding);
      prov_w = 0;
    }
    if (i == 6) {
      prov_h = 3*(n_rows*(block_dim+block_padding) + prov_y_padding);
      prov_w = 0;
    }
    d3.select('.prov.' + prov).attr("transform", "translate(" + prov_w + "," + prov_h + ")" );
  });
}

function create_dropdown(id, data_list) {
  var sel = d3.select(id).selectAll('option')
    .data(data_list, function(d) { return d; })
    .enter()
    .append('option')
    .attr('value', function(d, i) { return i; })
    .html(function(d) { return d; });

}

function get_selected_row(id, data_list) {
  if (data_list.length > 0) {
    var selected_row_index = d3.select(id + " option:checked").attr('value')
    var selected_row = data_list[selected_row_index];
    return selected_row;
  } else {
    return null;
  }
}

function type(d) {
  d['riding_number'] = +d['riding_number'];
  d['region_number'] = +d['region_number'];
  return d;
}
