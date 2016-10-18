var blocks = function() {

  var margin = {top: 50, right: 160, bottom: 0, left: 5},
      width = page_w - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      block_dim = (page_w < 750) ? 13 : 15,//15,
      block_padding = 8.*block_dim/15.,//8,
      n_rows = (page_w < 750) ? 15 : 6,//6,
      prov_x_padding = 20,
      prov_y_padding = 50,
      region_label_y_padding = 30,
      region_x_padding = {'STV': 0., 'MMP': 2.*block_padding, 'FPTP': 0., 'DMP': 0., 'IRV': 0.},
      border_padding = 0.25*block_padding,
      riding_padding = 12,
      riding_border_padding = 3,
      column_height = (block_dim + block_padding)*n_rows,
      mp_padding = 2,
      mp_dim = 15;

  d3.selectAll('.title').style('margin-bottom', (page_w < 750) ? '2rem' : '0px');

  var g = create_g('#block-chart', width, height, margin);

  function init(error, fptp, dmp, mmp, irv, stv) {

    var dataz = {};
    dataz['FPTP'] = {};
    dataz['DMP'] = {};
    dataz['MMP'] = {};
    dataz['IRV'] = {};
    dataz['STV'] = {};

    provs.forEach(function(d) {
      dataz['FPTP'][d] = fptp.filter(function(e) { return e.prov_abbr == d; });
      dataz['DMP'][d] = dmp.filter(function(e) { return e.prov_abbr == d; });
      dataz['MMP'][d] = mmp.filter(function(e) { return e.prov_abbr == d; });
      dataz['IRV'][d] = irv.filter(function(e) { return e.prov_abbr == d; });
      dataz['STV'][d] = stv.filter(function(e) { return e.prov_abbr == d; });
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
      {label: 'Riding', class: 'x', type: 'riding-border'}
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

    // var prov_width = {};
    var riding_bbox;
        // province_x = 0,
        // province_y = 0,
        // prov_row_height = {0: 0},
        // prov_row = 0;

    g.selectAll('.prov-label').attr('y', (sel_system == 'MMP') ? -4*block_padding : -2*block_padding);

    provs.forEach(function(prov) {

      var prov_rows = dataz[sel_system][prov].filter(function(d) { return d.prov_abbr == prov; });
      var unique_region_numbers = Array.from(new Set(prov_rows.map(function(d) { return d.region_number; })));

      d3.select('g.prov.' + prov).selectAll('.region').remove();

      var region_g = d3.select('g.prov.' + prov).selectAll('.region').data(unique_region_numbers);

      region_g.enter()
        .append('g')
        .attr('class', function(d) { return 'region r' + d; });

      if (sel_system == 'MMP') {
        region_g.append('text')
          .attr('class', 'region-label')
          .attr('x', -0.5*block_padding)
          .attr('y', -1.5*block_padding)
          .html(function(d, i) { return 'R-' + (d+1); })
          .attr('font-size', (page_w < 750) ? 13 : 16);
      }

      var region_x = 0;

      unique_region_numbers.forEach(function(region_number, i) {

        var region = d3.select('g.region.r' + region_number)
          .attr("transform", "translate(" + region_x + "," + 0 + ")" );

        var region_rows = prov_rows.filter(function(d) { return d.region_number == region_number; });
        var unique_riding_numbers = Array.from(new Set(region_rows.map(function(d) { return d.riding_number; })));
        unique_riding_numbers = unique_riding_numbers.filter(function(d) { return d != -1; }); // -1 is assigned to regional mps

        var non_riding_mps = region_rows.filter(function(d) { return d == -1; });

        var riding_x = 0,
            riding_y = 0;
        unique_riding_numbers.forEach(function(riding_number) {

          var riding = region.append('g').attr('class', 'riding');
          var riding_mps = region_rows.filter(function(d) { return d.riding_number == riding_number; });

          riding_mps.forEach(function(mp, i) {
            riding.append('rect')
              .attr('class', mp.party + ' mp')
              .attr('width', block_dim)
              .attr('height', block_dim)
              .attr('x', Math.floor(i/n_rows)*(mp_dim+mp_padding))
              .attr('y', (i%n_rows)*(mp_dim+mp_padding))

          });

          if (riding_y + riding.node().getBBox().height > column_height) {
            riding_y = 0;
            riding_x += riding_bbox.width + riding_padding;
          }

          riding_bbox = riding.node().getBBox();

          riding.append('rect')
            .attr('class', 'riding-border')
            .attr('width', riding_bbox.width + 2.*riding_border_padding)
            .attr('height', riding_bbox.height + 2.*riding_border_padding)
            .attr('x', -riding_border_padding)
            .attr('y', -riding_border_padding);

          riding.attr("transform", "translate(" + riding_x + "," + riding_y + ")" );

          riding_y += riding_bbox.height + riding_padding;

        })

        // var local_seat_rows = region_rows.filter(function(d) { return d.seat_type == 'local'; });
        // var regional_seat_rows = region_rows.filter(function(d) { return d.seat_type == 'regional'; });
        //
        // if (sel_system == 'DMP') {
        //   local_seat_rows = local_seat_rows.sort(function(a, b) { return a.riding_number - b.riding_number; });
        // } else {
        //   local_seat_rows = local_seat_rows.sort(function (a, b) { return parties.indexOf(a.party) - parties.indexOf(b.party); })
        //   regional_seat_rows = regional_seat_rows.sort(function (a, b) { return parties.indexOf(a.party) - parties.indexOf(b.party); })
        // }
        //
        // var sorted_seat_rows = local_seat_rows.concat(regional_seat_rows);


        var region_bbox = region.node().getBBox();

        region_x += region_bbox.width;


        region.append('rect')
          .attr('class', 'region-border')
          .attr('x', region_bbox.x - border_padding)
          .attr('y', region_bbox.y - border_padding)
          .attr('height', region_bbox.height + 2.*border_padding)
          .attr('width', region_bbox.width + 2.*border_padding)


      });

      // var province = d3.select('g.prov.' + prov)
      //
      // var province_bbox = province.node().getBBox();
      // prov_row_height[prov_row] = Math.max(prov_row_height[prov_row], province_bbox.height);
      //
      // if (province_x + province_bbox.width > width) {
      //   province_x = 0;
      //   province_y += prov_row_height[prov_row] + prov_y_padding;
      //   prov_row += 1;
      //   prov_row_height[prov_row] = 0;
      // }
      // province.attr("transform", "translate(" + province_x + "," + province_y + ")" );
      //
      // province_x += province_bbox.width + prov_x_padding;

    })
    set_provs_translate(provs, sel_system, sel_region);


    // set_provs_translate(provs, dataz, prov_width, sel_system, sel_region);

  }

  function set_provs_translate(provs, sel_system, sel_region) {
    var province_x = 0,
    province_y = 0,
    prov_row_height = {0: 0},
    prov_row = 0;

    var provs_to_show;
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
        var province = d3.select('g.prov.' + prov)

        var province_bbox = province.node().getBBox();
        prov_row_height[prov_row] = Math.max(prov_row_height[prov_row], province_bbox.height);

        if (province_x + province_bbox.width > width) {
          province_x = 0;
          province_y += prov_row_height[prov_row] + prov_y_padding;
          prov_row += 1;
          prov_row_height[prov_row] = 0;
        }


        province.style('display', 'block')
          .transition(500)
          .attr("transform", "translate(" + province_x + "," + province_y + ")" );

        province_x += province_bbox.width + prov_x_padding;
        }
    })

    d3.select('#block-chart')
      .transition(500)
      .attr("height", (province_y + prov_row_height[prov_row] + prov_y_padding) + margin.top + margin.bottom);

    }

  // function set_provs_translate(provs, dataz, prov_width, sel_system, sel_region) {
  //   var y_padding = (sel_system == 'MMP') ? prov_y_padding + region_label_y_padding : prov_y_padding,
  //       prov_translate = {},
  //       left_pos = 0,
  //       top_pos = 0,
  //       provs_to_show;
  //
  //   if (sel_region == 'Canada') {
  //     provs_to_show = provs;
  //   } else {
  //     provs_to_show = [sel_region];
  //   }
  //
  //   provs.forEach(function(prov) {
  //
  //     if (provs_to_show.indexOf(prov) < 0) {
  //       d3.select('.prov.' + prov)
  //         .style('display', 'none');
  //     } else {
  //       var right_pos = left_pos + prov_width[prov];
  //
  //       if (right_pos > page_w) {
  //         left_pos = 0;
  //         top_pos += n_rows*(block_dim+block_padding) + y_padding;
  //         prov_translate[prov] = [left_pos, top_pos];
  //       } else {
  //         prov_translate[prov] = [left_pos, top_pos];
  //       }
  //
  //       left_pos += prov_width[prov] + prov_x_padding;
  //
  //       d3.select('.prov.' + prov)
  //         .style('display', 'block')
  //         .transition(500)
  //         .attr("transform", "translate(" + prov_translate[prov][0] + "," + prov_translate[prov][1] + ")" );
  //
  //     }
  //   });
  //
  //   var bottom_pos = top_pos + n_rows*(block_dim+block_padding);
  //   d3.select('#block-chart').transition(500).attr("height", bottom_pos + margin.top + margin.bottom);
  //
  // }

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
