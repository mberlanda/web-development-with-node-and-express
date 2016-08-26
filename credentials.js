module.exports = {
  cookieSecret: 'your cookie secret goes here',
  gmail: {
    user: 'your gmail username',
    password: 'your gmail password',
  },
  mongo: {
    development: {
      connectionString: 'mongodb://localhost:27017/test',
    },
    production: {
      connectionString: 'your_production_connection_string',
    },
  },
};