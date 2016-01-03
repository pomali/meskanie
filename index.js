var express = require('express');
var app = express();
var pg = require('pg');
var util = require('util');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.post('/', function(req, res) {
  console.log(req.body);
  //TODO: validate
  var lat = req.body.lat;
  var lon = req.body.lon;
  var line = req.body.line;
  var place = req.body.place;
  var delay = req.body.delay;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('INSERT INTO meskania (lat, lon, line, place, delay) VALUES(?, ?, ?, ?, ?)', [lat, lon, line, place, delay], function(err, result) {
      done();
      if (err){ 
        console.error(err); 
        res.send("Error " + err); 
      }
      else { 
        res.send("Ok");
      }
    });
  });
});

app.get('/data', function(req, res) {
  pg.connect(process.env.DATABASE_URL+"?ssl=true", function(err, client, done) {
    client.query('SELECT * FROM meskania', 
      function(err, result) {
        done();
        if (err) { 
          console.error(err); 
          res.send("Error " + err); 
        }
        else { 
          res.json(result.rows); 
        }
      }
      );
  });
});



// Start App
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



/*

create table meskania (id serial primary key, date_created timestamp, lat NUMERIC(8,5), lon NUMERIC(8,5), line int, place varchar(60), delay interval minute);

 */
