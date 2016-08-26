var express = require('express');
var app = express();

app.use(function(req, res, next){
  // create a domain for this request
  var domain = require('domain').create();
  // handle errors on this domain
  domain.on('error', function(err){
    console.error('DOMAIN ERROR CAUGHT\n', err.stack);
    try {
      // failsafe shutdown in 5 seconds
      setTimeout(function(){
      console.error('Failsafe shutdown.');
      process.exit(1);
      }, 5000);
      // disconnect from the cluster
      var worker = require('cluster').worker;
      if(worker) worker.disconnect();
      // stop taking new requests
      server.close();
      
      try {
        // attempt to use Express error route
        next(err);
      
      } catch(err){
        // if Express error route failed, try
        // plain Node response
        console.error('Express error mechanism failed.\n', err.stack);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Server error.');
      }
    } catch(err){
      console.error('Unable to send 500 response.\n', err.stack);
    }
  });
  // add the request and response objects to the domain
  domain.add(req);
  domain.add(res);
  // execute the rest of the request chain in the domain
  domain.run(next);
});

// other middleware and routes go here
var server = app.listen(app.get('port'), function() {
console.log('Listening on port %d.', app.get('port'));
});