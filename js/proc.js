(function() {

  window._proc = {
    charts: function(charts) {
      return charts
        .map(function(chart) {
          var title = chart
            .replace(/^.*\/([a-z0-9]+)\..*/i, '$1')
            .replace(/([A-Z])/g, ' $1')
            .replace(/([0-9]+)/g, ' $1')
            .trim();
          var id = title.replace(/\s/g, '-').toLowerCase();
          var src = chart.split('/').slice(1).join('/');

          return {
            columns: true,
            filter: '',
            floatLines: false,
            id: id,
            hideChords: false,
            src: src,
            text: null,
            title: title,
            transposition: 0,
            zoom: 0
          };
        })
        .sort(function(a, b) {
          return a.id < b.id ? -1 : 1;
        })
        // have to add the index after sorting
        .map(function(chart, i) {
          chart.index = i;

          return chart;
        });
    },
    _transpose: function(line, transposition) {
      var sharps = ['A', 'A&sharp;', 'B', 'C', 'C&sharp;', 'D', 'D&sharp;', 'E', 'F', 'F&sharp;', 'G', 'G&sharp;'];
      var flats = ['A', 'B&flat;', 'B', 'C', 'D&flat;', 'D', 'E&flat;', 'E', 'F', 'G&flat;', 'G', 'A&flat;'];

      return line
        .replace(/\[.+?\]/g, function(chord) {
          return chord
            .replace(/([A-G#b]+)/g, function(note) {
              note = note
                .slice(0, 2)
                .replace('#', '&sharp;')
                .replace('b', '&flat;');

              var scale = note.indexOf('&flat;') === 1 ? flats : sharps;
              var index = (scale.indexOf(note) + transposition) % scale.length;

              if( index < 0 ) {
                index += scale.length;
              }

              return scale[index];
            });
        });
    },
    _setChartData: function(chart) {
      return chart.text
        .split(/\n\n\-\-\-\n\n/)
        .map(function(column) {
          return column
            .split(/\n\n/)
            .map(function(section) {
              return section
                .split(/\n/)
                .map(function(line) {
//                   return chart.hideChords ?
//                     line.replace(/\[.*?\]/g, '') :
//                     _proc._transpose(line, chart.transposition);
                  return _proc._transpose(line, chart.transposition);
                });
            });
        });
    },
    chart: function(chart) {
      chart.text = chart.text.replace(/(<([^>]+)>)/gi, '');
      chart.data = _proc._setChartData(chart);

      return chart;
    }
  };

})();
