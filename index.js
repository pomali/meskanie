var express = require('express');
var app = express();
var pg = require('pg');
var util = require('util');
var db_connection_str = process.env.DATABASE_URL+"?ssl=true"
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.post('/', function(req, res) {
  console.log(req);
  //TODO: validate
  var lat = parseFloat(req.body.lat);
  var lon = parseFloat(req.body.lon);
  var line = parseInt(req.body.line);
  var place = req.body.place;
  var delay = parseFloat(req.body.delay);
  var date_created = req.body.when;


  pg.connect(db_connection_str, function(err, client, done) {
    client.query(
'INSERT INTO meskania (lat, lon, line, place, delay, date_created) VALUES ($1, $2, $3, $4, $5, $6);', [lat, lon, line, place, delay + "m", date_created], 
function(err, result) {
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

app.get('/api/data', function(req, res) {
  pg.connect(db_connection_str, function(err, client, done) {
    client.query('SELECT * FROM meskania ORDER BY id DESC LIMIT 20', 
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
