var blocks = function() {

  var margin = {top: 50, right: 160, bottom: 25, left: 5},
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
      {label: 'Liberal MP', class: 'Liberal', type: 'mp'},
      {label: 'Conservative MP', class: 'Conservative', type: 'mp'},
      {label: 'NDP MP', class: 'NDP', type: 'mp'},
      {label: 'Bloc Quebecois MP', class: 'Bloc', type: 'mp'},
      {label: 'Green MP', class: 'Green', type: 'mp'},
      {label: 'Riding', class: 'x', type: 'riding_border'}
    ];

    draw_legend('#chart', legend_entries);

    return dataz;

  }

  function update(dataz, sel_system) {

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
          .html(function(d, i) { return 'R-' + d; })
      }

      var region_x_translate = 0;
      regions.forEach(function(region_number, i) {

        var rg = d3.select('g.region.r' + region_number);
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

        rg.append('rect')
          .attr('class', 'region_border')
          .attr('width', region_w)
          .attr('height', region_h)
          .attr('x', -1*block_padding)
          .attr('y', -1*block_padding)

        rg.attr("transform", "translate(" + region_x_translate + "," + 0 + ")" );
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

        var riding_borders = rg.selectAll('.riding_border').data(ridings);

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

        var mps = rg.selectAll('.mp').data(sorted_seat_rows);

        mps.exit().remove();

        mps.enter()
          .append('rect')
          .attr('class', function(d) { return 'mp ' + d.party; });

        mps.attr('width', block_dim)
          .attr('height', block_dim)
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
    var y_padding = (sel_system == 'MMP') ? prov_y_padding + region_label_y_padding : prov_y_padding;

    provs.forEach(function(prov, i) {
      if (i != 0) {
        prov_w += prov_width[provs[i-1]] + prov_x_padding;
      }

      if (i == 4) {
        prov_h = n_rows*(block_dim+block_padding) + y_padding;
        prov_w = 0;
      }

      if (i == 5) {
        prov_h = 2*(n_rows*(block_dim+block_padding) + y_padding);
        prov_w = 0;
      }
      // if (i == 6) {
      //   prov_h = 3*(n_rows*(block_dim+block_padding) + y_padding);
      //   prov_w = 0;
      // }
      d3.select('.prov.' + prov).attr("transform", "translate(" + prov_w + "," + prov_h + ")" );
    });
  }

  function type(d) {
    d['riding_number'] = +d['riding_number'];
    d['region_number'] = +d['region_number'];
    return d;
  }

  function draw_legend(id, entries) {

    var svg_w = block_dim+block_padding,
        svg_h = block_dim+block_padding;

    var legend_div = d3.select(id + ' .legend')
      .style('width', margin.right + 'px')
      .style('position', 'absolute')
      .style('left', (width+margin.left + 10) + 'px' )
      .style('top', '20px' )

      entries.forEach(function(d, i) {
        var entry = legend_div.append('div')
          .attr('class', 'entries')
          .style('position', 'relative')
          .style('width', margin.right + 'px')
          .style('margin-bottom', '5px')

        entry.append('div')
          .attr('class', 'text')
          .style('width', (margin.right - svg_w - 5) + 'px')
          .style('padding-left', (svg_w + 5) + 'px')
          .style('size', block_dim + 'px')
          .style('line-height', (block_dim+block_padding) + 'px')
          .html(d.label)

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

        } else if (d.type == 'riding_border') {
          g.append('rect')
          .attr('x', 0.25*block_padding)
          .attr('width', block_dim + 0.5*block_padding)
          .attr('y', 0.25*block_padding)
          .attr('height', block_dim + 0.5*block_padding)
          .attr('class', d.type + ' ' + d.class);
        }
    })

  }

return {
        init: init,
        type: type,
        update: update
    };

}();
