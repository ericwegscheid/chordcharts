(function() {

  window.__ = window.__ || {
    _return: function(param, fn, _return) {
      var result = fn();

      return _return
        ? result
          ? param
          : void 0
        : result;
    },
    isArr: function(param, _return) {
      return __._return(param, function() {
        return Array.isArray(param);
      }, _return);
    },
    isFn: function(param, _return) {
      return __._return(param, function() {
        return typeof param == 'function';
      }, _return);
    },
    isStr: function(param, _return) {
      return __._return(param, function() {
        return typeof param == 'string';
      }, _return);
    },
    isNum: function(param, _return) {
      return __._return(param, function() {
        return typeof param == 'number';
      }, _return);
    },
    isBool: function(param, _return) {
      return __._return(param, function() {
        return typeof param == 'boolean';
      }, _return);
    },
    isObj: function(param, _return) {
      return __._return(param, function() {
        return param &&
          !__.isArr(param) &&
          !__.isFn(param) &&
          !__.isStr(param) &&
          !__.isNum(param) &&
          !__.isBool(param);
      }, _return);
    },
    isNill: function(param, _return) {
      return __._return(param, function() {
        return param === undefined || param === null
      }, _return);
    },
    isSet: function(param) {
      return param !== void 0;
    },
    select: function(query, all) {
      return document[all ? 'querySelectorAll' : 'querySelector'](query);
    },
    copy: function(str) {
      var el = document.createElement('textarea');

      el.style.opacity = 0;
      el.value = str;

      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    capitalize: function(str) {
      return str[0].toUpperCase() + str.slice(1);
    },
    uriToJson: function() {
      var i, len, pair,
        output = {},
        pairs = location.search.slice(1).split('&');

      for( i = 0, len = pairs.length; i < len; i++ ) {
        pair = pairs[i].split('=');

        output[pair[0]] = pair[1];
      }

      return output;
    },
    get: function(uri, onSuccess, onFail) {
      var req = new XMLHttpRequest();

      req.onreadystatechange = function() {
        if( req.readyState === 4 ) {
          if( req.status === 200 ) {
            (__.isFn(onSuccess, true) || function() {})(req);

          } else {
            (__.isFn(onFail, true) || function() {})(req);
          }
        }
      }

      req.open('Get', uri);
      req.send();
    },
    getQueryParams: function() {
      return JSON.parse('{' + location.search
        .slice(1)
        .split(';')
        .map(function(param, i) {
          var split = param.split('=');

          return '"' + split[0] + '": "' + split[1] + '"';
        })
        .join(',') +
        '}');
    },
    getElementIndex: function(element) {
      let { previousSibling } = element;
      let count = 0;

      while( previousSibling ) {
        count++;
        previousSibling = previousSibling.previousSibling;
      }

      return count;
    }
  };
})();
