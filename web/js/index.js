create_dropdown('#voting-system-dropdown', voting_systems);
create_dropdown('#region-dropdown', regions);

var dropdown_h = +d3.select('#nav-inner').style('height').slice(0, -2);
d3.select('#nav').style('height', (dropdown_h+15) + 'px');
d3.select('#top-content').style('margin-top', (dropdown_h+15) + 'px');

d3.queue()
  .defer(d3.json, './data/tot_summary.json')
  .defer(d3.csv, './data/pct_summary.csv', bars.type)
  .defer(d3.csv, './data/fptp_clean.csv', blocks.type)
  .defer(d3.csv, './data/dmp_clean.csv', blocks.type)
  .defer(d3.csv, './data/mmp_clean.csv', blocks.type)
  .defer(d3.csv, './data/irv_clean.csv', blocks.type)
  .defer(d3.csv, './data/stv_clean.csv', blocks.type)
  .awaitAll(
    function(error, files) {
      function init_all() {
        page_w = +d3.select('#main').style('width').slice(0,-2);
        table.init(error, files[0]);
        bars.init(error, files[1]);
        var dataz = blocks.init(error, files[2], files[3], files[4], files[5], files[6]);
        return dataz;
      }
      var dataz = init_all();
      d3.selectAll('select').on('change', update_all);
      // window.addEventListener('resize', init_all, false);

      update_all();

      function update_all() {

        var sel_system = get_selected_row('#voting-system-dropdown', voting_systems);
        var sel_region = get_selected_row('#region-dropdown', regions);
        var sel_system_label = voting_systems.filter(function(d) { return d.abbr == sel_system; })[0].label;
        var sel_region_label = regions.filter(function(d) { return d.abbr == sel_region; })[0].label;

        d3.select('#system-title').html(sel_system_label);
        d3.select('#region-title').html(sel_region_label);

        table.update(files[0], sel_system, sel_region);
        bars.update(files[1], sel_system, sel_region);
        blocks.update(dataz, sel_system, sel_region);
      }

  });
