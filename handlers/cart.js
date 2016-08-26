var nodeMailer = require('nodemailer');
var credentials = require('../credentials.js');

// mailer setup
var mailTransport = nodeMailer.createTransport('SMTP',{
  service: 'Gmail',
  auth: {
    user: credentials.gmail.user,
    pass: credentials.gmail.password,
  }
});

// email validation
// slightly modified version of the official W3C HTML5 email regex:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
var VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
'[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');



// Sending HTML Email
exports.checkout = function(req, res){
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
};

exports.email = function(req, res){
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
};