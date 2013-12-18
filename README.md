#Piwik2Solr

Piwik2Solr is a simple POC nodejs app to update solr indexes from piwik stats.
Current version only works with the Frontkom setup.

### Installation

* Clone the repo
* install the nodejs dependencies with `npm install`
* Create a new file named `settings.json` with the following info/structure:

```
{
  "piwikToken": "your-piwik-api-key",
  "piwikUrl": "the-piwik-stats-url",
  "siteId": site-id,
  "solrUrl": "target-solr-index-url"
}
```

### Update the index
To update the stats info on the target index just run the node app.

* Exec `node update`


