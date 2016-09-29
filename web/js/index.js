create_dropdown('#voting-system-dropdown', voting_systems);
create_dropdown('#region-dropdown', regions);

d3.queue()
  .defer(d3.csv, './data/fptp_clean.csv', blocks.type)
  .defer(d3.csv, './data/dmp_clean.csv', blocks.type)
  .defer(d3.csv, './data/mmp_clean.csv', blocks.type)
  .defer(d3.csv, './data/irv_clean.csv', blocks.type)
  .defer(d3.csv, './data/summary.csv', bars.type)
  .awaitAll(
    function(error, files) {
      var dataz = blocks.init(error, files[0], files[1], files[2], files[3]);
      bars.init(error, files[4]);

      d3.selectAll('select').on('change', update_all);
      update_all();

      function update_all() {
        var sel_system = get_selected_row('#voting-system-dropdown', voting_systems);
        var sel_region = get_selected_row('#region-dropdown', regions);
        var sel_system_label = voting_systems.filter(function(d) { return d.abbr == sel_system; })[0].label;
        var sel_region_label = regions.filter(function(d) { return d.abbr == sel_region; })[0].label;
        d3.select('#system-title').html(sel_system_label);
        d3.select('#region-title').html(sel_region_label);

        blocks.update(dataz, sel_system, sel_region);
        bars.update(files[4], sel_system, sel_region);
      }

  });
