var formidable = require('formidable');

// filesystem persistence
var fs = require('fs');

var dataDir = __dirname + '/../data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath){
  // TODO...this will come later
}

// File Upload
exports.vacationPhoto = {
  get: function(req,res){
    var now = new Date();
    res.render('contest/vacation-photo',{
      year: now.getFullYear(),month: now.getMonth()
    });
  },
  post: function(req, res){
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
      return res.redirect(303, '/contest/vacation-photo')
    });
  },
}