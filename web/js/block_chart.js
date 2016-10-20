var blocks = function() {

  var margin = {top: 50, right: 5, bottom: 0, left: 5},
      width = page_w - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      block_dim = (page_w < 750) ? 13 : 15,//15,
      block_padding = 8.*block_dim/15.,//8,
      n_rows = (page_w < 750) ? 15 : 6,//6,
      prov_x_padding = 20,
      prov_y_padding = 50,
      region_label_y_padding = 30,
      region_x_padding = (page_w < 750) ? 4 : 16,
      border_padding = 0.25*block_padding,
      riding_border_padding = (page_w < 750) ? 2 : 3,
      mp_padding = 2,
      mp_dim = (page_w < 750) ? 10 : 15,
      riding_padding = (page_w < 750) ? 10 : 12,
      column_height_most = (mp_dim + block_padding)*(n_rows),
      column_height_stv = (mp_dim + block_padding)*(n_rows-1);
// console.log(page_w)

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

    draw_legend('#chart', legend_entries, page_w, mp_dim, block_padding);

    return dataz;

  }

  function update(dataz, sel_system, sel_region) {

    // show/hide text
    d3.selectAll('.' + sel_system).style('display', 'block');
    voting_systems.filter(function(d) { return d.abbr != sel_system; }).forEach(function(d) {
      d3.selectAll('.' + d.abbr).style('display', 'none');
    });

    var riding_bbox;

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
        var local_mp_rows = region_rows.filter(function(d) { return d.seat_type == 'local'; });
        var regional_mp_rows = region_rows.filter(function(d) { return d.seat_type == 'regional'; });

        var local_riding_numbers = Array.from(new Set(local_mp_rows.map(function(d) { return d.riding_number; })));
        var regional_riding_numbers = Array.from(new Set(regional_mp_rows.map(function(d) { return d.riding_number; })));

        function get_riding_array(riding_numbers) {
          var riding_array = [];
          riding_numbers.forEach(function(riding_number) {
            var riding_rows = region_rows.filter(function(d) { return d.riding_number == riding_number; });
            var obj = {};
            obj['riding_number'] = riding_number;
            obj['n_ridings'] = riding_rows.length;
            obj['first_party'] = riding_rows[0].party;
            obj['seat_type'] = riding_rows[0].seat_type;
            riding_array.push(obj);
          });
          riding_array = riding_array.sort(function (a, b) {
            if (a.n_ridings == 1 && b.n_ridings == 1) {
              return parties.indexOf(a.first_party) - parties.indexOf(b.first_party);
            }
            return b.n_ridings - a.n_ridings;
          });
          return riding_array;
        }

        var local_riding_array = get_riding_array(local_riding_numbers);
        var regional_riding_array = get_riding_array(regional_riding_numbers);

        var riding_x = 0,
            riding_y = 0;
        local_riding_array.concat(regional_riding_array).forEach(function(riding_obj) {

          var riding = region.append('g').attr('class', 'riding ' + riding_obj.seat_type);
          var riding_mps = region_rows.filter(function(d) { return d.riding_number == riding_obj.riding_number; });
          riding_mps = riding_mps.sort(function (a, b) { return parties.indexOf(a.party) - parties.indexOf(b.party); });

          riding_mps.forEach(function(mp, i) {
            riding.append('rect')
              .attr('class', mp.party + ' mp')
              .attr('width', mp_dim)
              .attr('height', mp_dim)
              .attr('x', Math.floor(i/n_rows)*(mp_dim+mp_padding))
              .attr('y', (i%n_rows)*(mp_dim+mp_padding))

          });

          var column_height = (sel_system == 'STV') ? column_height_stv : column_height_most;
          if (riding_y + riding.node().getBBox().height > column_height) {
            riding_y = 0;
            riding_x += riding_bbox.width + riding_padding;
          }

          riding_bbox = riding.node().getBBox();

          var border_points = get_border_points(riding);
          var s = stringify_points(border_points);

          riding.append('polygon')
            .attr('class', 'riding-border')
            .attr('points', s);

          riding.attr("transform", "translate(" + riding_x + "," + riding_y + ")" );

          riding_y += riding_bbox.height + riding_padding;

        })

        var region_bbox = region.node().getBBox();

        region_x += region_bbox.width + region_x_padding;

        region.append('rect')
          .attr('class', 'region-border')
          .attr('x', region_bbox.x - border_padding)
          .attr('y', region_bbox.y - border_padding)
          .attr('height', region_bbox.height + 2.*border_padding)
          .attr('width', region_bbox.width + 2.*border_padding)

      });

    })
    set_provs_translate(provs, sel_system, sel_region);

  }

  function set_provs_translate(provs, sel_system, sel_region) {
    var province_x = 0,
        prov_translate = [],
        prov_row = 0,
        provs_to_show = (sel_region == 'Canada') ? provs : [sel_region];

    provs.forEach(function(prov) {

      if (provs_to_show.indexOf(prov) >= 0) {
        var province = d3.select('g.prov.' + prov);
        var province_bbox = province.node().getBBox();
        if (province_x + province_bbox.width > width) {
          province_x = 0;
          prov_row += 1;
        }
        prov_translate.push({province: prov, x_translate: province_x, row_number: prov_row, height: province_bbox.height});
        province_x += province_bbox.width + prov_x_padding;
        }

    })
    var row_translate = 0,
        row_translate_dict = {};
    var all_rows = Array.from(new Set(prov_translate.map(function(d) { return d.row_number; })));
    all_rows.forEach(function(n) {
      row_translate_dict[n] = row_translate;
      var provs_on_row = prov_translate.filter(function(d) { return d.row_number == n; });
      row_height = d3.max(provs_on_row, function(d) { return d.height; });
      row_translate += row_height + prov_y_padding;
    });

    provs.forEach(function(prov) {
      if (provs_to_show.indexOf(prov) < 0) {
        d3.select('.prov.' + prov)
          .style('display', 'none');
      } else {
        var obj = prov_translate.filter(function(d) { return d.province == prov; })[0];
        var province = d3.select('g.prov.' + prov);
        province.style('display', 'block')
          .transition(500)
          .attr("transform", "translate(" + obj.x_translate + "," + row_translate_dict[obj.row_number] + ")" );

        }
    });

    var chart_bbox = d3.select('#block-chart g').node().getBBox();

    d3.select('#block-chart')
      .transition(500)
      .attr("height", row_translate + margin.top + margin.bottom);
  }


  function type(d) {
    d['riding_number'] = +d['riding_number'];
    d['region_number'] = +d['region_number'];
    return d;
  }

  function get_border_points(g) {
    var border_pad = 3.;//riding_padding/2.;
    var bbox_all_mps = g.node().getBBox();
    var bbox_last_mp = g.selectAll('.mp').last().node().getBBox();

    var points = [
      [bbox_all_mps.x-border_pad, bbox_all_mps.y-border_pad], // top-left
      [bbox_all_mps.x-border_pad, bbox_all_mps.y+bbox_all_mps.height+border_pad], // bottom-left
      [bbox_last_mp.x-mp_padding+border_pad, bbox_all_mps.y+bbox_all_mps.height+border_pad], // bottom-center
      [bbox_last_mp.x-mp_padding+border_pad, bbox_last_mp.y+bbox_last_mp.height+border_pad], // center-center
      [bbox_last_mp.x+bbox_last_mp.width+border_pad, bbox_last_mp.y+bbox_last_mp.height+border_pad], // center-right
      [bbox_last_mp.x+bbox_last_mp.width+border_pad, bbox_all_mps.y-border_pad] // top-right
    ];
    return points;
  }


  function stringify_points(points) {
    var string = '';
    points.forEach(function(p) {
      string = string.concat(p[0] + ',' + p[1] + ' ')
    })
    return string
  }

return {
        init: init,
        type: type,
        update: update
    };

}();
