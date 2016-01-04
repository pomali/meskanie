var geoloc_options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}
var prec = 10000
var google_api_key = "AIzaSyATrt6-3belIckOOmzFKgSd8hzWT-R-VWQ"
var map_map;
var map_infowindow;
var map_service;


function map_initialize(pos){
  loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
  map_map = new google.maps.Map(document.getElementById('map'),
      {center: loc,
        scrollwheel: false,
        zoom: 15 });
  map_infowindow = new google.maps.InfoWindow();
  var request = {
    location: loc,
    radius: pos.coords.accuracy*2 + 500,
    types: ['train_station','bus_station','subway_station','transit_station']
  };

  map_service = new google.maps.places.PlacesService(map_map);
  map_service.search(request, places_callback);
  var map_position = new google.maps.Marker({
    position: loc,
      title: 'Your Location',
      map: map_map,
      icon: {path: google.maps.SymbolPath.CIRCLE, 
        scale:3,
        fillColor: 'white', 
        strokeColor: 'green'
      }
  });

  var map_accuracy = new google.maps.Circle({
center: loc,
map: map_map,
radius: pos.coords.accuracy,
strokeWeight: 0.1,
strokeColor: '#009966',
fillColor: '#00CCCC'
});
}

function places_callback(results, status){
  var names = new Array();
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      names.push( results[i]['name'] )
    }
  }
console.log(names)
  $("#form-place").autocomplete( {source: names, 
    //autofocus: true,
    delay: 100,
    minLength: 0
  }).focus()
}



function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map_map,
      position: place.geometry.location
  });
  var content='<strong style="font-size:1.2em">'+place.name+'</strong>'+
    '<br/><strong>Latitude:</strong>'+placeLoc.lat()+
    '<br/><strong>Longitude:</strong>'+placeLoc.lng()+
    '<br/><strong>Type:</strong>'+place.types[0]+
    '<br/><strong>Rating:</strong>'+(place.rating||'n/a');
  var more_content='<img src="http://googleio2009-map.googlecode.com/svn-history/r2/trunk/app/images/loading.gif"/>';

  //make a request for further details
  map_service.getDetails({reference:place.reference}, function (place, status) 
      {
        if (status == google.maps.places.PlacesServiceStatus.OK) 
  {
    more_content='<hr/><strong><a href="'+place.url+'" target="details">Details</a>';

    if(place.website)
  {
    more_content+='<br/><br/><strong><a href="'+place.website+'" target="details">'+place.website+'</a>';
  }
  }
      });


  google.maps.event.addListener(marker, 'click', function() {

    map_infowindow.setContent(content+more_content);
    map_infowindow.open(map_map, this);
  });
}

function report_delay(){
  $(this).slideUp();
  $("#form-post-delay").show("slow");
  // detect location
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(pos){
          //success
          var coords = pos.coords;
          $("#form-lat").val(Math.round(pos.coords.latitude * prec)/prec);
          $("#form-lon").val(Math.round(pos.coords.longitude*prec)/prec);
          map_initialize(pos);
        },
        function(err){
          // error || user didn't accept
          console.warn("Error: " + err);
        },
        geoloc_options
        );
  }
  else{
    // browser doesn't support geolocation
    console.log("Browser doesn't support geolocation");
  }
  // guess transit stop
  // choose transit stop
  var now = new Date();
  $("#form-when").val(now.getHours() + ":" + now.getMinutes());
  $(".js-save").show("slow");
  return false;
}

$(function(){
  console.log('ready');
  $(".js-new").on("click", report_delay);

  $("#form-post-delay").submit(function(e){
    console.log($("#form-post-delay").serialize());
    $.ajax({
      type: "POST",
      url: '/', 
      data: $("#form-post-delay").serialize(),
      success: function(d){ 
        console.log(d); 
        $("#form-post-delay").slideUp(
          function(){ 
            console.log("after");
            $("#form-post-delay").after( '<div class="row"><h2>Ďakujeme!</h2></div>');
          }
          )
      }
    });
    e.preventDefault();
  });

  $.ajax({
    url: "/api/data",
    type: "GET",
    dataType: "json",
    success: function(json){
      $.each(json, function(k,v){ 
        $(".js-late-list").append(
            '<tr>' +
              '<td>'+ v.line +'</td>' +
              '<td>'+ v.place +'</td>' +
              '<td>'+ v.delay.minutes +'</td>' +
            '</tr>');
      });
    },
    error: function(xhr, s, err){
             alert("Sorry bracho, nieco sa posralo!");
             console.log( "Error: " + err );
             console.log( "Status: " + s );
             console.dir( xhr );
           }
  });
});
