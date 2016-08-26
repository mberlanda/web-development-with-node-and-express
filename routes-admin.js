module.exports = function(admin){
  
  admin.get('/', function(req, res){
  res.render('jquery-test');
  });
  
  admin.get('/users', function(req, res){
    res.render('about');
  });
};