
var request = require('request');
var moment = require('moment');
var fs = require('fs');

var file = fs.readFileSync('./settings.json');
var setts = JSON.parse(file);

var visited = [];
var statsTs = moment().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
console.log('stats_timestamp:', statsTs);

function getList (idSub, path) {
  // Call the piwik api
  var qs = {
    module: 'API',
    method: 'Actions.getPageUrls',
    idSite: setts.siteId,
    date: 'last7',
    period: 'range',
    format: 'JSON',
    token_auth: setts.piwikToken
  };
  if(idSub) {
    qs.idSubtable = idSub;
  }

  request.get({
    url: setts.piwikUrl,
    qs: qs
  },
  function (err, res, body) {
    var data = JSON.parse(body);

    for (var i = 0, l = data.length; i < l; i++) {
      var page = data[i];
      var subtable = page.idsubdatatable;
      var label = page.label;
      if( label.slice(0,1) === '/' ) label = label.substr(1);

      var alias = path + '/' + label;
      console.log('>', alias, page.nb_hits);

      getArticle(alias, page.nb_hits);

      if(subtable && visited.indexOf(subtable) < 0) {
        visited.push(subtable);
        getList(subtable, path + '/' + label);
      }
    }
  });
}

function getArticle(path, score) {
  // body...
  request.get({
    url: setts.solrUrl + '/select',
    qs: {
      wt: 'json',
      q: 'path_alias:' + path.substr(1)
    }
  },
  function (err, res, body) {
    var content = JSON.parse(body);
    if(!content.response.numFound) {
      console.log('NOT FOUND:', path, score);
      console.log('');
      return;
    }

    var article = content.response.docs[0];
    console.log('FOUND:', path);
    console.log(article.title, score);
    console.log('');

    updateArticle(article.id, score, '');

    // console.log(body);
  });
}

function updateArticle(id, score, ts) {
  request.post({
    url: setts.solrUrl + '/update/json',
    json: true,
    qs: {
      commit: true
    },
    body: [{
      id: id,
      weekly_score: {set: score},
      stats_timestamp: {set: statsTs}
    }]
  },function (err, res, body) {
    console.log('Updated ', id);
    console.log(body);
  });
}

getList(0, '');
