var geoloc_options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}
function report_delay(){
  $(this).slideUp();
  // detect location
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(pos){
          //success
          var coords = pos.coords;
          $("#form-lat").val(pos.coords.latitude);
          $("#form-lon").val(pos.coords.longitude);
          $("#form-line").focus();
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
  $(".js-save").show("slow");
  return false;
}

$(function(){
  console.log('ready');
  $(".js-new").on("click", report_delay);
  $.ajax({
    url: "/data",
    type: "GET",
    dataType: "json",
    success: function(json){
      $.each(json, function(k,v){ 
        $(".js-late-list").append("<li>"+v+"</li>");
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
