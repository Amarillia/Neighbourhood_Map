   /*The initMap function initializes and adds the map when the web page loads.*/
var map;
var service;
var geocoder;


function initMap() {
	//create a variable for the location using latitude and longitude
	var derby = {lat: 52.922608, lng: -1.476161};
	//creates a new google map
	map = new google.maps.Map(document.getElementById('map'),{
		//the center of the map is Derby, UK
		center: derby,
		//maximum zoom
		zoom:12,
		//displays a pan control for panning the map
		panControl:true,
		//displays a slider or "+/-" buttons to control the zoom level of the map
		zoomControl:true,
		//picks the best zoom control based on device and map size
		zoomControlOptions: {
			style:google.maps.ZoomControlStyle.DEFAULT
		},
		//lets the user toggle between map types (roadmap and satellite)
		mapTypeControl:false,
		//displays a map scale element
		scaleControl:false,
		//displays a Pegman icon which can be dragged to the map to enable Street View
		streetViewControl:true,
		//displays a thumbnail overview map reflecting the current map viewport within a wider area
		overviewMapControl:true,
		//displays a small circular icon which allows you to rotate maps
		rotateControl:true,
		//if it is false enables default controls
		disableDefaultUI:false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
	})

	//Function for toggle traffic on the map
	function toggleTraffic(){
		if(trafficLayer.getMap() == null){
		//traffic layer is disabled.. enable it
		trafficLayer.setMap(map);
		} else {
		//traffic layer is enabled.. disable it
		trafficLayer.setMap(null);             
		}
	}

	trafficLayer = new google.maps.TrafficLayer();
	//add a DOM listener that will execute the trafficToggle
	//function when clicked on the toggleTraffic button 
	google.maps.event.addDomListener(document.getElementById('trafficToggle'), 'click', toggleTraffic);

	//add unique style for the map
	styles = [{"featureType":"road","stylers":[{"hue":"#FFBB00"},{"saturation":44},{"lightness":38},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-62},{"lightness":46},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.2},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.2},{"lightness":2.4},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.1},{"lightness":11.2},{"gamma":1}]}];
	map.setOptions({styles: styles});

	var service = new google.maps.places.PlacesService(map);
	  service.nearbySearch({
	    location: derby,
	    radius: 500,
	    type: ['book_store']
	  }, processResults);

	function callback(place, status) {
	  if (status == google.maps.places.PlacesServiceStatus.OK) {
	    createMarker(place);
	  }
	}

	function processResults(results, status) {
	  if (status !== google.maps.places.PlacesServiceStatus.OK) {
	    return;
	  } else {
	    createMarkers(results);
	  }
	}

	function createMarkers(places) {
	  var bounds = new google.maps.LatLngBounds();
	  var placesList = document.getElementById('places');

	  for (var i = 0, place; place = places[i]; i++) {
	    var image = {
	      url: place.icon,
	      size: new google.maps.Size(71, 71),
	      origin: new google.maps.Point(0, 0),
	      anchor: new google.maps.Point(17, 34),
	      scaledSize: new google.maps.Size(25, 25)
	    };

	    var marker = new google.maps.Marker({
	      map: map,
	      draggable:false,
	      icon: image,
	      animation: google.maps.Animation.DROP,
	      title: place.name,
	      position: place.geometry.location
	    });

	    bounds.extend(place.geometry.location);
	  }
  
  	map.fitBounds(bounds);

//Searching for the entered/requested location

var geocoder = new google.maps.Geocoder();

        document.getElementById('submit').addEventListener('click', function() {
          geocodeAddress(geocoder, map);
        });
      }

      function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
}
}


