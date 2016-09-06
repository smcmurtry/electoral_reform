

var q = queue();
q.defer(d3.csv, './data/fptp_clean.csv', blocks.type);
q.defer(d3.csv, './data/dmp_clean.csv', blocks.type);
q.defer(d3.csv, './data/mmp_clean.csv', blocks.type);
q.defer(d3.csv, './data/irv_clean.csv', blocks.type);
q.await(blocks.init);


var q2 = queue();
q2.defer(d3.csv, './data/summary.csv', bars.type);
q2.await(bars.init);
