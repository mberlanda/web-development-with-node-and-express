// handlers
var main = require('./handlers/main.js');
var tours = require('./handlers/tours.js');
var contest = require('./handlers/contest.js');
var cart = require('./handlers/cart.js');
var jqupload = require('./handlers/jqupload.js');

module.exports = function(app){
  app.get('/', main.home);
  app.get('/about', main.about);
  app.get('/headers', main.headers);
  app.get('/thank-you', main.thankYou);
  app.get('/error', main.error);
  app.get('/jquery-test', main.jqueryTest);
  app.get('/nursery-rhyme', main.nurseryRhyme);
  app.get('/data/nursery-rhyme', main.nurseryRhymeData);
  app.get('/newsletter', main.newsletter.get);
  app.get('/newsletter/archive', main.newsletter.archive);
  app.post('/newsletter', main.newsletter.post);
  app.post('/process', main.process);

  app.get('/tours/hood-river', tours.hoodRiver);
  app.get('/tours/request-group-rate', tours.requestGroupRate);

  app.get('/contest/vacation-photo', contest.vacationPhoto.get);
  app.post('/contest/vacation-photo/:year/:month', contest.vacationPhoto.post);


  app.get('/email/cart-thank-you', cart.email)
  app.post('/cart/checkout', cart.checkout);


  app.use('/upload', jqupload.upload);
};