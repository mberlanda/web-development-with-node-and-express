var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var nodeMailer = require('nodemailer');
var mongoose = require('mongoose');

// libs
var fortune = require('./lib/fortune.js');
var weatherData = require('./lib/weather-data.js');
var credentials = require('./credentials.js');

// models
var Vacation = require('./models/vacation.js');
var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');

// MongoDB Connection
var opts = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
};
switch(app.get('env')){
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error('Unknown execution environment: ' + app.get('env'));
}

// Sending Initial Data
Vacation.find(function(err, vacations){
  if(err) return cosole.error(err);
  if(vacations.length) return;
  
  new Vacation({
    name: 'Hood River Day Trip',
    slug: 'hood-river-day-trip',
    category: 'Day Trip',
    sku: 'HR199',
    description: 'Spend a day sailing on the Columbia and ' +
    'enjoying craft beers in Hood River!',
    priceInCents: 9995,
    tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Oregon Coast Getaway',
    slug: 'oregon-coast-getaway',
    category: 'Weekend Getaway',
    sku: 'OC39',
    description: 'Enjoy the ocean air and quaint coastal towns!',
    priceInCents: 269995,
    tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Rock Climbing in Bend',
    slug: 'rock-climbing-in-bend',
    category: 'Adventure',
    sku: 'B99',
    description: 'Experience the thrill of climbing in the high desert.',
    priceInCents: 289995,
    tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
    inSeason: true,
    requiresWaiver: true,
    maximumGuests: 4,
    available: false,
    packagesSold: 0,
    notes: 'The tour guide is currently recovering from a skiing accident.',
  }).save();
});

// filesystem persistence
var fs = require('fs');

var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath){
  // TODO...this will come later
}

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

// loggers
switch(app.get('env')){
  case 'development':
    // compact, colorful dev logging
    app.use(require('morgan')('dev'));
    break;
  case 'production':
    // module 'express-logger' supports daily log rotation
    app.use(require('express-logger')({
     path: __dirname + '/log/requests.log'
    }));
  break;
}

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
    if(err){
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: 'There was an error processing your submission. ' +
          'Please try again.',
      };
      return res.redirect(303, '/contest/vacation-photo');
    }
    var photo = files.photo;
    var dir = vacationPhotoDir + '/' + Date.now();
    var path = dir + '/' + photo.name;
    fs.mkdirSync(dir);
    fs.renameSync(photo.path, dir + '/' + photo.name);
    saveContestEntry('vacation-photo', fields.email,
      req.params.year, req.params.month, path);
    req.session.flash = {
      type: 'success',
      intro: 'Good luck!',
      message: 'You have been entered into the contest.'
    };
    return res.redirect(303, '/contest/vacation-photo/entries')
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

// take the server down
app.get('/epic-fail', function(req, res){
  process.nextTick(function(){
    throw new Error('Kaboom!');
  });
});

// retrieving data
app.get('/vacations', function(req, res){
  Vacation.find({ available: true }, function(err, vacations){
    /* bad implementation
    var context = {
      vacations: products.map(function(vacations){
        vacation.price = vacation.getDisplayPrice();
        return vacation;
      });
    };
    */
    var context = {
      vacations: vacations.map(function(vacation){
        return {
          sku: vacation.sku,
          name: vacation.name,
          description: vacation.description,
          price: vacation.getDisplayPrice(),
          inSeason: vacation.inSeason,
        }
      })
    };
    res.render('vacations', context);
  });
});

// adding data
app.get('/notify-me-when-in-season', function(req, res){
  res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', function(req, res){
  VacationInSeasonListener.update(
    { email: req.body.email },
    { $push: { skus: req.body.sku } },
    { upsert: true },
    function(err){
      if(err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, '/vacations');
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You will be notified when this vacation is in season.',
      };
      return res.redirect(303, '/vacations');
    }
  );
});

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

// scaling out with app clusters
function startServer() {
  app.listen(app.get('port'), function(){
    console.log( 'Express started in ' + app.get('env') +
      ' mode on http://localhost:'  + app.get('port') +
      '; press Ctrl-C to terminate.'
    );
  });
}

if(require.main === module){
  // application run directly; start app server
  startServer();
} else {
  // application imported as a module via "require": export function
  // to create server
  module.exports = startServer;
}