# Web Development with Node and Express

This repo is presenting the examples of the book [Web Development with Node and Express](http://shop.oreilly.com/product/0636920032977.do) by Ethan Brown.


#### ch01: Introducing Express
> The [Express website](http://expressjs.com/) describes Express as “a minimal and flexible node.js web application framework, providing a robust set of features for building single and multipage and hybrid web applications.”

#### ch02: Getting Started with Node
[https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)

```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
/hello_world $ nodejs helloWorld.js 
Server started on localhost:3000; press Ctrl-C to terminate....
```

#### ch03: Saving Time with Express
```
$ npm install --save express
$ npm install --save express-handlebars
```

#### ch04: Tidying Up
- created package.json
- moved fortuneCookies into a lib module

#### ch05: Quality Assurance
- Page testing
- Cross-page testing
- Logic testing
- Linting
- [Link checking](https://wummel.github.io/linkchecker/)
```bash
# Page testing
$ npm install --save-dev mocha
$ mkdir public/vendor
$ cp node_modules/mocha/mocha.js public/vendor
$ cp node_modules/mocha/mocha.css public/vendor
$ npm install --save-dev chai
$ cp node_modules/chai/chai.js public/vendor

# Cross-page testing
$ npm install --save-dev zombie@3.1.1
$ sudo npm install -g mocha
$ mocha -u tdd -R spec qa/tests-crosspage.js 2>/dev/null

# Logic testing
$ mocha -u tdd -R spec qa/tests-unit.js

# Linting
$ sudo npm install -g jshint
$ jshint meadowlark.js
```

Automating with Grunt:
```bash
$ sudo npm install -g grunt-cli
$ npm install --save-dev grunt
# grunt plugins
$ npm install --save-dev grunt-cafe-mocha
npm ERR! peerinvalid The package grunt@1.0.1 does not satisfy its siblings' peerDependencies requirements!
npm ERR! peerinvalid Peer grunt-cafe-mocha@0.1.13 wants grunt@~0.4.1
npm ERR! peerinvalid Peer grunt-contrib-jshint@1.0.0 wants grunt@>=0.4.0

$ npm install --save-dev grunt-contrib-jshint
$ npm install --save-dev grunt-exec
```

---
#### ch06: The Request and Response Object
```javascript
var req = 'The Request Object';

req.params; // return []
req.param(name); // recommended to avoid
req.query; // querystring parameters
req.body;
req.route;
req.cookies; // req.signedCookies;
req.headers;
req.accepts([types]); // such as application/json for API
req.ip;
req.path;
req.host;
req.xhr; // true if request orginated from AJAX
req.protocol; // http - https
req.secure; // true if https
req.url // req.originalUrl
req.acceptedLanguages;

var res = 'The Response Object';

res.status(code); // sets status code
res.set(name, value); // response header
res.cookie(name, value, [options]); // res.clearCookie(name, [options])
res.redirect([status], url);
res.send(body); // res.send(status, body); first res.set('Content-Type', 'text/plain')
res.json(json); // res.json(status, json)
res.jsonp(json); // res.jsonp(status, json)
res.type(type); // res.type('txt')
res.format(object); // res.format({'text/plain': 'hi there', 'text/html': '<b>hi there</b>'})
res.attachment([filename]); // res.download(path, [filename], [callback])
res.sendFile(path, [options], [callback]);
res.links(links);
res.locals;
res.render(view, [locals], callback);
```

Rendering Content:
```javascript
// basic usage
  app.get('/about', function(req, res){
  res.render('about');
});
// response codes other than 200
app.get('/error', function(req, res){
  res.status(500);
  res.render('error');
});
// or on one line...
app.get('/error', function(req, res){
  res.status(500).render('error');
});

// passing a context to a view, including querystring, cookie, and session values
app.get('/greeting', function(req, res){
  res.render('about', {
    message: 'welcome',
    style: req.query.style,
    userid: req.cookie.userid,
    username: req.session.username,
  });
});

// the following layout doesn't have a layout file, so views/no-layout.handlebars
// must include all necessary HTML
app.get('/no-layout', function(req, res){
  res.render('no-layout', { layout: null });
});

// the layout file views/layouts/custom.handlebars will be used
app.get('/custom-layout', function(req, res){
  res.render('custom-layout', { layout: 'custom' });
});

// rendering plaintext output
app.get('/test', function(req, res){
  res.type('text/plain');
  res.send('this is a test');
});

// this should appear AFTER all of your routes
// note that even if you don't need the "next"
// function, it must be included for Express
// to recognize this as an error handler
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).render('error');
});

// this should appear AFTER all of your routes
app.use(function(req, res){
  res.status(404).render('not-found');
});
```

Processing Forms:
```javascript
// body-parser middleware must be linked in
app.post('/process-contact', function(req, res){
  console.log('Received contact from ' + req.body.name +
  ' <' + req.body.email + '>');
  // save to database....
  res.redirect(303, '/thank-you');
});

// body-parser middleware must be linked in (more robust)
app.post('/process-contact', function(req, res){
  console.log('Received contact from ' + req.body.name +
    ' <' + req.body.email + '>');
  try {
    // save to database....
    return res.xhr ?
    res.render({ success: true }) :
    res.redirect(303, '/thank-you');
  } catch(ex) {
    return res.xhr ?
      res.json({ error: 'Database error.' }) :
      res.redirect(303, '/database-error');
  }
});
```

Providing an API:
```javascript
var tours = [
  { id: 0, name: 'Hood River', price: 99.99 },
  { id: 1, name: 'Oregon Coast', price: 149.95 },
];

// simple GET endpoint returning only JSON
app.get('/api/tours', function(req, res){
  res.json(tours);
});

// GET endpoint that returns JSON, XML, or text
app.get('/api/tours', function(req, res){
  
  var toursXml = '<?xml version="1.0"?><tours>' +
    products.map(function(p){
      return '<tour price="' + p.price +
      '" id="' + p.id + '">' + p.name + '</tour>';
    }).join('') + '</tours>';

  var toursText = tours.map(function(p){
    return p.id + ': ' + p.name + ' (' + p.price + ')';
  }).join('\n');
  
  res.format({
    'application/json': function(){
      res.json(tours);
    },

    'application/xml': function(){
      res.type('application/xml');
      res.send(toursXml);
    },

    'text/xml': function(){
      res.type('text/xml');
      res.send(toursXml);
    },
    'text/plain': function(){
      res.type('text/plain');
      res.send(toursXml);
    }
  });
});

// API that updates a tour and returns JSON; params are passed using querystring
app.put('/api/tour/:id', function(req, res){
  var p = tours.filter(function(p){ return p.id === req.params.id })[0];
  if( p ) {
    if( req.query.name ) p.name = req.query.name;
    if( req.query.price ) p.price = req.query.price;
    res.json({success: true});
  } else {
    res.json({error: 'No such tour exists.'});
  }
});

// API that deletes a product
api.del('/api/tour/:id', function(req, res){
  var i;
  for( var i=tours.length-1; i>=0; i-- )
    if( tours[i].id == req.params.id ) break;
  if( i>=0 ) {
    tours.splice(i, 1);
    res.json({success: true});
  } else {
    res.json({error: 'No such tour exists.'});
  }
});
```

---
#### ch07: Templating with Handlebars
[Jade](http://jade-lang.com/)

Handlebars:
- comments
```html
{{! super-secret comment }}
<!-- not-so-secret comment -->
```
- blocks
```
{
  currency: {
    name: 'United States dollars',
    abbrev: 'USD',
  },
  tours: [
    { name: 'Hood River', price: '$99.95' },
    { name: 'Oregon Coast', price, '$159.95' },
  ],
  specialsUrl: '/january-specials',
  currencies: [ 'USD', 'GBP', 'BTC' ],
}
```
```html
<ul>
  {{#each tours}}
    {{! I'm in a new block...and the context has changed }}
    <li>
      {{name}} - {{price}}
        {{#if ../currencies}}
        ({{../../currency.abbrev}})
      {{/if}}
    </li>
  {{/each}}
</ul>
{{#unless currencies}}
  <p>All prices in {{currency.name}}.</p>
{{/unless}}
{{#if specialsUrl}}
  {{! I'm in a new block...but the context hasn't changed (sortof) }}
  <p>Check out our <a href="{{specialsUrl}}">specials!</a></p>
{{else}}
  <p>Please check back often for specials.</p>
{{/if}}
<p>
  {{#each currencies}}
    <a href="#" class="currency">{{.}}</a>
  {{else}}
    Unfortunately, we currently only accept {{currency.name}}.
  {{/each}}
</p>
```
- Server-Side Templates
```javascript
// npm install --save express-handlebars
var handlebars = require('express-handlebars')
  .create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// layout on
app.get('/foo', function(req, res){
  res.render('foo');
});
// layout off
app.get('/foo', function(req, res){
  res.render('foo', { layout: null });
});
// custom layout
app.get('/foo', function(req, res){
  res.render('foo', { layout: 'custom' });
});
```
- partials (see weather partial example)
- sections (see jquery-test example)
- Client-Side Handlebars(see nursery-rhyme example)

---
#### ch08: Form Handling
- HTML Forms
```html
<form action="/process" method="POST">
<input type="hidden" name="hush" val="hidden, but not secret!">
  <div>
    <label for="fieldColor">Your favorite color: </label>
    <input type="text" id="fieldColor" name="color">
  </div>
  <div>
    <button type="submit">Submit</button>
  </div>
</form>
```
- Form Handling with Express / Handling AJAX Forms (see newsletter example)
```
npm install --save body-parser
```
- File Uploads
```
npm install --save formidable
```