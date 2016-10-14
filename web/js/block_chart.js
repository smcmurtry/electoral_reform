var blocks = function() {

  var margin = {top: 50, right: 160, bottom: 0, left: 5},
      width = page_w - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      block_dim = 15,
      block_padding = 8,
      n_rows = 6,
      prov_x_padding = 20,
      prov_y_padding = 50,
      region_label_y_padding = 30;

  var g = create_g('#block-chart', width, height, margin);

  function init(error, fptp, dmp, mmp, irv) {

    var dataz = {};
    dataz['FPTP'] = {};
    dataz['DMP'] = {};
    dataz['MMP'] = {};
    dataz['IRV'] = {};

    provs.forEach(function(d) {
      dataz['FPTP'][d] = fptp.filter(function(e) { return e.prov_abbr == d; });
      dataz['DMP'][d] = dmp.filter(function(e) { return e.prov_abbr == d; });
      dataz['MMP'][d] = mmp.filter(function(e) { return e.prov_abbr == d; });
      dataz['IRV'][d] = irv.filter(function(e) { return e.prov_abbr == d; });
    });

    var prov_g = g.selectAll('g.prov')
      .data(provs)
      .enter()
      .append('g')
      .attr('class', function(d) { return 'prov ' + d; });

    prov_g.append('text')
      .attr('class', 'prov-label')
      .attr('x', -0.5*block_padding)
      // .attr('y', -2*block_padding)
      .html(function(d) { return d; })

    var legend_entries = [
      {label: 'MP', class: 'black', type: 'mp'},
      {label: 'Riding', class: 'x', type: 'riding_border'}
    ];

    draw_legend('#chart', legend_entries, page_w, block_dim, block_padding);

    return dataz;

  }

  function update(dataz, sel_system, sel_region) {

    // show/hide text
    d3.selectAll('.' + sel_system).style('display', 'block');
    voting_systems.filter(function(d) { return d.abbr != sel_system; }).forEach(function(d) {
      d3.selectAll('.' + d.abbr).style('display', 'none');
    });

    var prov_width = {};

    if (sel_system == 'MMP') {
      g.selectAll('.prov-label').attr('y', -4*block_padding);
    } else {
      g.selectAll('.prov-label').attr('y', -2*block_padding);
    }

    provs.forEach(function(prov) {

      var prov_rows = dataz[sel_system][prov].filter(function(d) { return d.prov_abbr == prov; });
      var regions = Array.from(new Set(prov_rows.map(function(d) { return d.region_number; })));

      d3.select('g.prov.' + prov).selectAll('.region').remove();

      var region_g = d3.select('g.prov.' + prov).selectAll('.region').data(regions);

      region_g.enter()
        .append('g')
        .attr('class', function(d) { return 'region r' + d; });

      if (sel_system == 'MMP') {
        region_g.append('text')
          .attr('class', 'region-label')
          .attr('x', -0.5*block_padding)
          .attr('y', -1.5*block_padding)
          .html(function(d, i) { return 'R-' + (d+1); })
      }

      var region_x_translate = 0;
      regions.forEach(function(region_number, i) {

        var region_rows = prov_rows.filter(function(d) { return d.region_number == region_number; });
        var ridings = Array.from(new Set(region_rows.map(function(d) { return d.riding_number; })));
        if (sel_system == 'MMP') {
          ridings = ridings.filter(function(d) { return d != 0; });
        };

        var seats_in_region = region_rows.length;
        var region_n_cols = Math.ceil(seats_in_region/n_rows);
        var region_w = region_n_cols*(block_dim+block_padding) + 2.*block_padding;//1.*block_padding;
        var region_h;
        if (region_rows.length >= n_rows) {
          region_h = n_rows*(block_dim+block_padding) + 1.*block_padding;
        } else {
          region_h = region_rows.length*(block_dim+block_padding) + 1.*block_padding;
        }

        var rg = d3.select('g.region.r' + region_number)
          .attr("transform", "translate(" + region_x_translate + "," + 0 + ")" );

        region_x_translate += region_w;

        var local_seat_rows = region_rows.filter(function(d) { return d.seat_type == 'local'; });
        var regional_seat_rows = region_rows.filter(function(d) { return d.seat_type == 'regional'; });

        if (sel_system == 'DMP') {
          local_seat_rows = local_seat_rows.sort(function(a, b) { return a.riding_number - b.riding_number; });
        } else {
          local_seat_rows = local_seat_rows.sort(function (a, b) { return parties.indexOf(a.party) - parties.indexOf(b.party); })
          regional_seat_rows = regional_seat_rows.sort(function (a, b) { return parties.indexOf(a.party) - parties.indexOf(b.party); })
        }

        var sorted_seat_rows = local_seat_rows.concat(regional_seat_rows);

        update_riding_borders(rg, ridings, sel_system);
        update_mps(rg, sorted_seat_rows);

      });
      prov_width[prov] = region_x_translate;

    })
    set_provs_translate(provs, dataz, prov_width, sel_system, sel_region);

  }

  function update_riding_borders(g, data, sel_system) {
    var riding_borders = g.selectAll('.riding_border').data(data);

    riding_borders.exit().remove();

    riding_borders.enter()
      .append('rect')
      .attr('class', function(d) { return 'riding_border ' + d; });

    riding_borders.attr('width', block_dim + 0.5*block_padding);

    if (sel_system == 'DMP') {
      riding_borders.attr('height', 2*block_dim + 1.5*block_padding)
        .attr('x', function(_, i) { return (Math.floor(i*2./n_rows))*(block_dim+block_padding) - 0.25*block_padding; } )
        .attr('y', function(_, i) { return ((2*i)%n_rows)*(block_dim+block_padding) - 0.25*block_padding; });
    } else {
      riding_borders.attr('height', block_dim + 0.5*block_padding)
        .attr('x', function(_, i) { return (Math.floor(i/n_rows))*(block_dim+block_padding) - 0.25*block_padding; } )
        .attr('y', function(_, i) { return (i%n_rows)*(block_dim+block_padding) - 0.25*block_padding; });
    }
  }

  function update_mps(g, data) {

    var mps = g.selectAll('.mp').data(data);

    mps.exit().remove();

    mps.enter()
      .append('rect')
      .attr('class', function(d) { return 'mp ' + d.party; });

    mps.attr('width', block_dim)
      .attr('height', block_dim)
      .attr('x', function(_, i) { return (Math.floor(i*1./n_rows))*(block_dim+block_padding); } )
      .attr('y', function(_, i) {
        
        return (i%n_rows)*(block_dim+block_padding)});
  }

  function set_provs_translate(provs, dataz, prov_width, sel_system, sel_region) {
    var y_padding = (sel_system == 'MMP') ? prov_y_padding + region_label_y_padding : prov_y_padding,
        prov_translate = {},
        left_pos = 0,
        top_pos = 0,
        provs_to_show;

    if (sel_region == 'Canada') {
      provs_to_show = provs;
    } else {
      provs_to_show = [sel_region];
    }

    provs.forEach(function(prov) {

      if (provs_to_show.indexOf(prov) < 0) {
        d3.select('.prov.' + prov)
          .style('display', 'none');
      } else {
        var right_pos = left_pos + prov_width[prov];

        if (right_pos > page_w) {
          left_pos = 0;
          top_pos += n_rows*(block_dim+block_padding) + y_padding;
          prov_translate[prov] = [left_pos, top_pos];
        } else {
          prov_translate[prov] = [left_pos, top_pos];
        }

        left_pos += prov_width[prov] + prov_x_padding;

        d3.select('.prov.' + prov)
          .style('display', 'block')
          .transition(500)
          .attr("transform", "translate(" + prov_translate[prov][0] + "," + prov_translate[prov][1] + ")" );

      }
    });

    var bottom_pos = top_pos + n_rows*(block_dim+block_padding);
    d3.select('#block-chart').transition(500).attr("height", bottom_pos + margin.top + margin.bottom);

  }

  function type(d) {
    d['riding_number'] = +d['riding_number'];
    d['region_number'] = +d['region_number'];
    return d;
  }

return {
        init: init,
        type: type,
        update: update
    };

}();
