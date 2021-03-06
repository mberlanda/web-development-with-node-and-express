// models
var Attraction = require('../models/attraction.js');

module.exports = {
  attraction: {
    index: function(req, res){
      Attraction.find({ approved: true }, function(err, attractions){
        if(err) return res.status(500).send('Error occurred: database error.');
        res.json(attractions.map(function(a){
        return {
          name: a.name,
          id: a._id,
          description: a.description,
          location: a.location,
        }
      }));
    });
  },
    create: function(req, res){
      var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
          event: 'created',
          email: req.body.email,
          date: new Date(),
        },
        approved: false,
      });
      a.save(function(err, a){
        if(err) return res.status(500).send('Error occurred: database error.');
        res.json({ id: a._id });
      });
    },
    show: function(req,res){
      Attraction.findById(req.params.id, function(err, a){
        if(err) return res.status(500).send('Error occurred: database error.');
        res.json({
          name: a.name,
          id: a._id,
          description: a.description,
          location: a.location,
        });
      });
    },
  }
}