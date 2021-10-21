// Refer config.sample.js to create environment MONGODB_EGEBJERG_URI first

var source = mongodb({
  uri: '${MONGODB_EGEBJERG_URI}',
});

var sink = elasticsearch({
  uri: 'http://localhost:9200/egebjerg-product',
});

t.Source('source', source, '/^product$/')
  // .Transform(skip({"field": "merchant", "operator": "=~", "match": 'shopee|sendo|lazada'}))
  .Transform(
    goja({
      filename: 'product_transform.js',
    })
  )
  .Save('_doc', sink, '/.*/');
