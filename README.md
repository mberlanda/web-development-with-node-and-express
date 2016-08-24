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