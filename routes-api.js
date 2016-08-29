module.exports = function(app){
  app.use(require('cors')());
  app.use('/api', require('cors')());
}
