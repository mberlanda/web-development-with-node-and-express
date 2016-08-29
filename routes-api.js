// handlers
var api = require('./handlers/api.js');

module.exports = function(app){
  app.use(require('cors')());
  app.use('/api', require('cors')());
  app.get('/api/attractions', api.attraction.index);
  app.post('/api/attraction', api.attraction.create);
  app.get('/api/attraction/:id', api.attraction.show);
}
