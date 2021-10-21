let config: any = null;
const fs = require('fs');

// Must use __dirname
// fs.existsSync('./config.server.ts') or fs.existsSync('config.server.ts') always return false
if (fs.existsSync(__dirname + '/config.server.js') || fs.existsSync(__dirname + '/config.server.ts')) {
    config = require("./config.server");
} else {
    config = require("./config.local");
}

let ES = require('@elastic/elasticsearch');
config.elasticSearch = new ES.Client({
    node: 'http://localhost:9200',
    // log: 'trace',
    apiVersion: config.elasticApiVersion, // use the same version of your Elasticsearch instance
});

export default config;