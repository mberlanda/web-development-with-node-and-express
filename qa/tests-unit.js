var fortune = require('../lib/fortune.js');
var weatherData = require('../lib/weather-data.js');
var expect = require('chai').expect;

suite('Fortune cookie tests', function(){
  test('getFortune() should return a fortune', function(){
    expect(typeof fortune.getFortune() === 'string');
  });
});

suite('Weather Data tests', function(){
  test('getWeatherData() should an object with locations attributes', function(){
    var result = weatherData.getWeatherData();
    expect(result).to.contain.all.keys(['locations']);
    expect(result.locations[0]).to.contain.all.keys(['forecastUrl', 'iconUrl', 'name', 'temp', 'weather']);
  });
}); 