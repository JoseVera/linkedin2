
/**
 * Module dependencies.
 */

var express = require('express')
  , linkedin_client = require('linkedin-js')('q48uy18vjnu2', 'am0vBuSPlFpwFZfR', 'http://localhost:3003/auth')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ; 
  
var store = new express.session.MemoryStore;

app = express();


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ store: store, secret: 'topsecret' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  
});


app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


app.get('/auth', function (req, res) {
  // the first time will redirect to linkedin
  linkedin_client.getAccessToken(req, res, function (error, token) {
    // will enter here when coming back from linkedin
    req.session.token = token;
    
    linkedin_client.apiCall('GET', '/people/~',
    {
      token: {
        oauth_token_secret: req.session.token.oauth_token_secret
      , oauth_token: req.session.token.oauth_token
      }
        
    }
    , function (error, result) {
      console.log(result);  
      res.render('auth', { result: result, title:'el titulo'});
      }
    );
    
  }, ['rw_nus', 'r_network', 'r_fullprofile'] /*This AccessToken should be granted these member permissions*/);
  
  
  
});



app.post('/message', function (req, res) {
  linkedin_client.apiCall('POST', '/people/~/shares',
    {
      token: {
        oauth_token_secret: req.session.token.oauth_token_secret
      , oauth_token: req.session.token.oauth_token
      }
    , share: {
        comment: req.param('message')
      , visibility: {code: 'anyone'}
      }
    }
  , function (error, result) {
      res.render('message_sent',{ result: result , error: error });
    }
  );
});

app.listen(3003);