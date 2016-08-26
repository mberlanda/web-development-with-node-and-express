// libs
var fortune = require('../lib/fortune.js');

exports.home = function(req, res){
  res.render('home');
};

exports.about = function(req, res){
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  } );
};

exports.headers = function(req, res){
  res.set('Content-Type','text/plain');
  var s = '';
  for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
  res.send(s);
};

exports.thankYou = function(req, res){
  res.render('thank-you');
};

exports.error = function(req, res){
  res.render('error');
};

exports.jqueryTest = function(req, res){
  res.render('jquery-test');
};

exports.nurseryRhyme = function(req, res){
  res.render('nursery-rhyme');
};

exports.nurseryRhymeData = function(req, res){
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  })
};

exports.newsletter = {
  get: function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
  },
  post: function(req, res){
    var name = req.body.name || '', email = req.body.email || '';
    // input validation
    if(!email.match(VALID_EMAIL_REGEX)) {
      // if(req.xhr) return res.json({ error: 'Invalid name email address.' });
      req.session.flash = {
        type: 'danger',
        intro: 'Validation error!',
        message: 'The email address you entered was not valid.',
      };
      return res.send({redirect: '/newsletter/archive'});
    } else {
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You have now been signed up for the newsletter.',
      };
      return res.send({redirect: '/newsletter/archive'});
    }
  },
  archive: function(req, res){
    res.render('newsletter/archive');
  },
};

exports.process = function(req, res){
  if(req.xhr || req.accepts('json,html')==='json'){
    // if there were an error, we would send { error: 'error description' }
    res.send({ success: true });
  } else {
    // if there were an error, we would redirect to an error page
    res.redirect(303, '/thank-you');
  }
};