var bars = function() {

  var margin = {top: 0, right: 160, bottom: 25, left: 5},
      page_w = 900,
      width = page_w - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      bar_h = 15,
      bar_padding = 8;

  var g = d3.select('#svg-chart-2')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function type(d) {
    ['Bloc', 'Conservative', 'Green', 'Liberal', 'NDP'].forEach(function(k) {
      d[k] = +d[k];
    });
    return d;
  }

  function init(error, data) {
    // console.log(data);
  }

return {
        init: init,
        type: type
    };

}();
