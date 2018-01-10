var map;
var geocoder;

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;
// Create a new blank array for all the listing markers.
var markers = [];
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
  });

        //Geocoder for the search button

      geocoder = new google.maps.Geocoder();

      document.getElementById('submit').addEventListener('click', function() {
        geocodeAddress(geocoder, map);
      });

      //Function for toggle traffic on the map
      function toggleTraffic(){
        if(trafficLayer.getMap() === null){
        //traffic layer is disabled.. enable it
        trafficLayer.setMap(map);
        } else {
        //traffic layer is enabled.. disable it
        trafficLayer.setMap(null);             
        }
      }
      //create new traffic layer
      trafficLayer = new google.maps.TrafficLayer();
      //add a DOM listener that will execute the trafficToggle
      //function when clicked on the toggleTraffic button 
      google.maps.event.addDomListener(document.getElementById('trafficToggle'), 'click', toggleTraffic);


        //var tribeca = {lat: 40.719526, lng: -74.0089934};

        // These are the real estate listings that will be shown to the user.
        // Normally we'd have these in a database instead.        
        var locations = [
          {title: 'University of Derby', location: {lat: 52.938061, lng: -1.496437}},
          {title: 'Derby Museum & Art Gallery', location: {lat: 52.923039, lng: -1.480145}},
          {title: 'Derby Silk Mill', location: {lat: 52.925690, lng: -1.475733}},
          {title: 'intu Derby', location: {lat: 52.919620, lng: -1.47265}},
          {title: 'Markeaton Park', location: {lat: 52.933525, lng: -1.50524}},
          {title: 'Landau Forte College Derby', location: {lat: 52.927171, lng: -1.473244}}
        ];

        var largeInfowindow = new google.maps.InfoWindow();

       

// Initialize the drawing manager.
        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          }
        });
        //var bounds = new google.maps.LatLngBounds();
        
 // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('f26161');
        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('3d0000');
        var largeInfowindow = new google.maps.InfoWindow();
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);

          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
        }
        document.getElementById('show-listings').addEventListener('click', showListings);
        document.getElementById('hide-listings').addEventListener('click', hideListings);
        document.getElementById('toggle-drawing').addEventListener('click', function() {
        toggleDrawing(drawingManager);
       });
        document.getElementById('zoom-to-area').addEventListener('click', function() {
          zoomToArea();
        });
      // Add an event listener so that the polygon is captured,  call the
        // searchWithinPolygon function. This will show the markers in the polygon,
        // and hide any outside of it.
        drawingManager.addListener('overlaycomplete', function(event) {
          // First, check if there is an existing polygon.
          // If there is, get rid of it and remove the markers
          if (polygon) {
            polygon.setMap(null);
            hideListings(markers);
          }
          // Switching the drawing mode to the HAND (i.e., no longer drawing).
          drawingManager.setDrawingMode(null);
          // Creating a new editable polygon from the overlay.
          polygon = event.overlay;
          polygon.setEditable(true);
          // Searching within the polygon.
          searchWithinPolygon();
          // Make sure the search is re-done if the poly is changed.
          polygon.getPath().addListener('set_at', searchWithinPolygon);
          polygon.getPath().addListener('insert_at', searchWithinPolygon);
        });
      }
      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

      // This function will loop through the markers array and display them all.
      function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }
      // This function will loop through the listings and hide them all.
      function hideListings() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }
      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
            // This shows and hides (respectively) the drawing options.
      function toggleDrawing(drawingManager) {
        if (drawingManager.map) {
          drawingManager.setMap(null);
          // In case the user drew anything, get rid of the polygon
          if (polygon !== null) {
            polygon.setMap(null);
          }
        } else {
          drawingManager.setMap(map);
        }
      }
      // This function hides all markers outside the polygon,
      // and shows only the ones within it. This is so that the
      // user can specify an exact area of search.
      function searchWithinPolygon() {
        for (var i = 0; i < markers.length; i++) {
          if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
          } else {
            markers[i].setMap(null);
          }
        }
      }

function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
            //TODO: Insert code here to take the first result's formatted address, and LOCATION.
            document.getElementById('firstComponent').innerHTML="The Formatted Address is:"; // PUT STUFF HERE
            document.getElementById('secondComponent').innerHTML="The Location is"; // PUT STUFF HERE
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }


// This function takes the input value in the find nearby area text input
      // locates it, and then zooms into that area. This is so that the user can
      // show all listings, then decide to focus on one area of the map.
      function zoomToArea() {
        // Initialize the geocoder.
        var geocoder = new google.maps.Geocoder();
        // Get the address or place that the user entered.
        var address = document.getElementById('zoom-to-area-text').value;
        // Make sure the address isn't blank.
        if (address == '') {
          window.alert('You must enter an area, or address.');
        } else {
          // Geocode the address/area entered to get the center. Then, center the map
          // on it and zoom in
          geocoder.geocode(
            { address: address,
              componentRestrictions: {locality: 'Derby'}
            }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
              } else {
                window.alert('We could not find that location - try entering a more' +
                    ' specific place.');
              }
            });
        }
      }

