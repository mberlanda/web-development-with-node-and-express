var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var nodeMailer = require('nodemailer');

// libs
var fortune = require('./lib/fortune.js');
var weatherData = require('./lib/weather-data.js');
var credentials = require('./credentials.js');

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
  defaultLayout:'main',
  helpers: {
    section: function(name, options){
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// mailer setup
var mailTransport = nodeMailer.createTransport('SMTP',{
  service: 'Gmail',
  auth: {
    user: credentials.gmail.user,
    pass: credentials.gmail.password,
  }
});

// before you start setting and accessing cookies in your app, you need to include
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}));

// tests
app.use(function(req, res, next){
  res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
  next();
});

// partials
app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = weatherData.getWeatherData();
  next();
});

// bootstrap flash messages
app.use(function(req, res, next){
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// email validation
// slightly modified version of the official W3C HTML5 email regex:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
var VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
'[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');

// form handling with express
app.use(require('body-parser').urlencoded({ extended: true }));

// routes go here....
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
  res.render('home');
});

app.get('/about', function(req, res){
  res.render('about', { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js' });
});

app.get('/tours/hood-river', function(req, res){
  res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
});

app.get('/headers', function(req,res){
  res.set('Content-Type','text/plain');
  var s = '';
  for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
  res.send(s);
});

app.get('/jquery-test', function(req, res){
  res.render('jquery-test');
});

app.get('/nursery-rhyme', function(req, res){
  res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res){
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  })
});

app.get('/thank-you', function(req, res){
  res.render('thank-you');
})

app.get('/error', function(req, res){
  res.render('error');
})


app.get('/newsletter/archive', function(req, res){
  res.render('newsletter/archive');
});

// Form Handling with Express
app.get('/newsletter', function(req, res){
  // we will learn about CSRF later...for now, we just
  // provide a dummy value
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/newsletter', function(req, res){
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
  /*
  // NewsletterSignup is an example of an object you might create;
  // since every implementation will vary, it is up to you to write these
  // project-specific interfaces. This simply shows how a typical Express
  // implementation might look in your project.
  new NewsletterSignup({ name: name, email: email }).save(function(err){
    if(err) {
      if(req.xhr) return res.json({ error: 'Database error.' });
        req.session.flash = {
          type: 'danger',
          intro: 'Database error!',
          message: 'There was a database error; please try again later.',
        }
      return res.redirect(303, '/newsletter/archive');
    }

    if(req.xhr) return res.json({ success: true });
    req.session.flash = {
      type: 'success',
      intro: 'Thank you!',
      message: 'You have now been signed up for the newsletter.',
    };
    return res.redirect(303, '/newsletter/archive');
  });
  */
});

/*
app.post('/process', function(req, res){
  console.log('Form (from querystring): ' + req.query.form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  res.redirect(303, '/thank-you');
});
*/
app.post('/process', function(req, res){
  if(req.xhr || req.accepts('json,html')==='json'){
    // if there were an error, we would send { error: 'error description' }
    res.send({ success: true });
  } else {
    // if there were an error, we would redirect to an error page
    res.redirect(303, '/thank-you');
  }
});

// File Upload
app.get('/contest/vacation-photo',function(req,res){
  var now = new Date();
  res.render('contest/vacation-photo',{
    year: now.getFullYear(),month: now.getMonth()
  });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
  });
});

// jQuery file upload

app.use('/upload', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    uploadDir: function(){
      return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function(){
      return '/uploads/' + now;
    },
  })(req, res, next);
});

// Sending HTML Email
app.post('/cart/checkout', function(req, res){
  var cart = req.session.cart;
  if(!cart) next(new Error('Cart does not exist.'));
  var name = req.body.name || '', email = req.body.email || '';
  // input validation
  if(!email.match(VALID_EMAIL_REGEX))
    return res.next(new Error('Invalid email address.'));
  // assign a random cart ID; normally we would use a database ID here
  cart.number = Math.random().toString().replace(/^0\.0*/, '');
  cart.billing = {
    name: name,
    email: email,
  };
  res.render('email/cart-thank-you',
    { layout: null, cart: cart }, function(err,html){
      if( err ) console.log('error in email template');
      mailTransport.sendMail({
        from: '"Meadowlark Travel": info@meadowlarktravel.com',
        to: cart.billing.email,
        subject: 'Thank You for Book your Trip with Meadowlark',
        html: html,
        generateTextFromHtml: true
      }, function(err){
        if(err) console.error('Unable to send confirmation: '
          + err.stack);
      });
    }
  );
  res.render('cart-thank-you', { cart: cart });
});

app.get('/email/cart-thank-you', function(req, res){
  var cart = req.session.cart;
  if(!cart){
    var cart = {
      number: Math.random().toString().replace(/^0\.0*/, ''),
      billing: {
        name: 'Test User',
        email: 'user@example.com',
      }
    };
  }
  res.render('email/cart-thank-you', { layout: null, cart: cart })
})

// custom 404 page
app.use(function(req, res){
  res.status(404);
  res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
  app.get('port') + '; press Ctrl-C to terminate.' );
});
