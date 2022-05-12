(function() {

  window._action = {
    clearFilter: function() {
        _data.filter = '';
        __.select('.menu .search input').value = '';
        __.select('.menu .search .clear-filter').classList.toggle('show', !!_data.filter);
        _render.menu();
    },
    filterMenu: function(e) {
      if( e.key.match(/[a-z0-9\s]+/ig) ) {
        _data.filter = e.target.value;
        __.select('.menu .search .clear-filter').classList.toggle('show', !!_data.filter);
        _render.menu();
      }
    },
    share: function() {
      var str = [
        location.origin,
        location.pathname,
        '?queue=',
        _data.queue.map(function(chartIndex) {
          var chart = _data.charts[chartIndex];

          return [
            chart.id,
            chart.transposition ? ':' + chart.transposition : ''
          ].join('');
        }).join(',')
      ].join('');

      __.copy(str);
      alert('Copied to clipboard: ' + str);
    },
    refresh: function() {
      _app.clearData('selectedChart');
      _app.clearData('charts');
      _app.reload();
    },
    clear: function() {
      _app.clearData('selectedChart');
      _app.clearData('charts');
      _app.clearData('queue');
      _app.clearData('queueIndex');
      _app.reload();
    },
    queueNav: function(direction) {
      _data.queueIndex += direction;
      _app.saveData('queueIndex');
      _action.selectChartFromQueue(
        _data.queueIndex < 0
          ? _data.queue.length - 1
          : _data.queueIndex !== _data.queue.length
            ? _data.queueIndex
            : 0
      );
    },
    removeFromQueue: function(index) {
      var chart = _data.charts[_data.queue[index]];

      if( chart.id === _data.selectedChart.id ) {
        __.select('h2').innerHTML = '';
        _render.chart();
      }

      _data.queue.splice(index, 1);
      _app.saveData('queue');
      _render.queue();
      _render.menu();
    },
    addToQueue: function(index) {
      var chart = _data.charts[index];

      if( !chart || !!~_data.queue.indexOf(chart.index)) {
        return;
      }

      _data.queue.push(index);
      _app.saveData('queue');
      _render.queue();
      _render.menu();
    },
    showChart: function(chart) {
      _proc.chart(chart);
      _render.chart(chart);

      var active = __.select('.menu ul li.active');

      if( active ) {
        active.classList.remove('active');
      }

      var listItem = __.select('#chart-' + chart.id);

      if( listItem ) {
        listItem.classList.add('active');
      }

      __.select('h2').innerHTML = chart.title;

      document.body.classList.remove('no-chart');
    },
    selectChartFromQueue: function(index, willRender) {
      var chart = _data.charts[_data.queue[index]];

      if( !chart ) {
        return;
      }

      _data.queueIndex = index;
      _app.saveData('queueIndex');

      _action.selectChart(_data.charts[_data.queue[index]].index);
    },
    selectChart: function(index) {
      var chart = _data.charts[index];

      if( !chart ) {
        console.warn('No chart selected');
        _render.chart();

        return;
      }

      if( (_data.selectedChart || {}).id === chart.id ) {
        _data.charts[chart.index] = _data.selectedChart;
//         _app.saveData('charts');
        _action.showChart(_data.selectedChart);

        return;
      }

      _data.selectedChart = chart;
      _app.saveData('selectedChart');

      __.get(
        chart.src,
        function(req) {
          chart.text = req.response;

          _action.showChart(chart);
        },
        function(req) {
          console.error(req.response);
        }
      );
    },
    collapse: function() {
      var isFull = document.body.classList.contains('full');

      document.body.classList.toggle('full', !isFull);
      __.select('.collapse').innerHTML = isFull ? '&lsaquo;' : '&rsaquo;'
    },
    loadCurrentSet: function() {
      window.location.href = [
        window.location.origin,
        window.location.pathname,
        '?queue=',
        _data.currentSet.join(',')
      ].join('');
    },
    theme: function(force) {
      var dark = typeof force !== 'boolean'
            ? !document.body.classList.contains('dark')
            : force,
        theme = dark ? 'LIGHT' : 'DARK';

      document.body.classList.toggle('dark', dark);
      __.select('span.theme button').innerHTML = theme;

      // save theme
      _data.useDarkTheme = dark ? 1 : 0;
      _app.saveData('useDarkTheme');
    },
    hideChords: function(force) {
      var hideChords = typeof force !== 'boolean'
            ? !_data.selectedChart.hideChords
            : force;

      _data.selectedChart.hideChords = hideChords;

      _app.saveData('selectedChart');
      _render.chart(_data.selectedChart, true);

      document.body.classList.toggle('lyrics-only', hideChords);
      __.select('span.lyrics button').innerHTML = hideChords ? 'CHORDS' : 'LYRICS';
    },
    columns: function(force) {
      var chart = __.select('.chart'),
          columns = typeof force !== 'boolean'
            ? chart.classList.contains('no-columns')
            : force;

      _data.selectedChart.columns = columns;
      _app.saveData('selectedChart');

      chart.classList.toggle('no-columns', !columns);
      __.select('button.columns').innerHTML = columns ? 'ON' : 'OFF';
    },
    floatLines: function(force) {
      var chart = __.select('.chart'),
          floatLines = typeof force !== 'boolean'
            ? !chart.classList.contains('float-lines')
            : force;

      _data.selectedChart.floatLines = floatLines;
      _app.saveData('selectedChart');

      chart.classList.toggle('float-lines', floatLines);
      __.select('button.float-lines').innerHTML = floatLines ? 'ON' : 'OFF';
    },
    zoom: function(direction) {
      _data.selectedChart.zoom += direction || 0;
      _app.saveData('selectedChart');

      if( !!~navigator.userAgent.indexOf('Chrome') ) {
        __.select('.chart > .column', true)
         .forEach(function(column) {
           var size = ((100 + _data.selectedChart.zoom) / 100) + 'em';

           column.style.fontSize = size;
           column.style.lineHeight = size;
         });

      } else {
        var chart = __.select('.chart');
        var val = ((100 + _data.selectedChart.zoom) / 100),
            scale = 'scale(' + val + ')',
            origin = 'top left';

        chart.style.zoom = val;
        chart.style['-moz-transform'] = scale;
        chart.style['-webkit-transform'] = scale;
        chart.style['-moz-transform-origin'] = origin;
        chart.style['-webkit-transform-origin'] = origin;

        if( document.body.classList.contains('full') ) {
          chart.style.width = (innerWidth / val) + 'px';

        } else {
          chart.style.width = ((innerWidth - 280) / val) + 'px';
        }
      }
    },
    transpose: function(direction) {
      _data.selectedChart.transposition += direction;
      _app.saveData('selectedChart');

      _proc.chart(_data.selectedChart);
      _render.chart(_data.selectedChart);
    }
  };

})();
