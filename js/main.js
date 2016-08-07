   /*The initMap function initializes and adds the map when the web page loads.*/
var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat: 52.9333, lng: -1.5},
		zoom:12,
		panControl:true,
		zoomControl:true,
		mapTypeControl:true,
		scaleControl:true,
		streetViewControl:false,
		overviewMapControl:true,
		rotateControl:true,
		disableDefaultUI:false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
	})

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
google.maps.event.addDomListener(document.getElementById('trafficToggle'), 'click', toggleTraffic);

styles = [{"featureType":"road","stylers":[{"hue":"#FFBB00"},{"saturation":44},{"lightness":38},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-62},{"lightness":46},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.2},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.2},{"lightness":2.4},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.1},{"lightness":11.2},{"gamma":1}]}];
map.setOptions({styles: styles});

markers = new Array();
for (i = 0; i < markers.length; i++) {
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(markers[i]),
		map: map,
		animation: google.maps.Animation.BOUNCE,
		title: "markers"+ i
	});
}
//infowindow = new google.maps.InfoWindow;

}
/*
google.maps.event.addListener(marker, 'click', function(){
infowindow.open(map,marker);
});
infowindow.open(map,marker);
google.maps.event.addDomListener(window, 'load', initMap);

}*/