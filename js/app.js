
var ViewModel = function (googleMap, myPlaces, infoWindow) {

	var self = this;

	self.map = googleMap;
	self.allPlaces = [];
	self.markers = [];
    myPlaces.forEach(function(place) {
    	newObj = new Place(place);

    	// Getting the geocode for the place.
    	var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': place.address }, function(results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
        		marker = new google.maps.Marker({
            		map: self.map,
            		position: results[0].geometry.location,
            		animation: google.maps.Animation.DROP,
            		title: newObj.name
        		});

        		self.markers.push(marker);

        		// Adding event listener to create a infowindow.
        		marker.addListener('click', function() {
			        populateInfoWindow(this, infoWindow);
			    });
    		}
		});
	    self.allPlaces.push(newObj);
  	});
}

var Place = function(data) {
	this.name = data.name;
	this.latlng = null;
	this.address = data.address;
	this.marker = null;
}

var createMap = function () {
	var map;

    // Constructor creates a new map - only center and zoom are required.
    // Centering map at Anfield.
    map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 53.4308294, lng: -2.96083},
    	mapTypeControl: false,
        zoom: 13
    });

    return map;
}

function initMap() {
google.maps.event.addDomListener(window, 'load', function(){

	// list of my places.
	var myPlaces = [
	{
		name: 'The Albert',
		address: '185 Walton Breck Rd, Liverpool L4 0RE, UK'
	},
	{
		name: 'Arkles',
		address: '77 Anfield Rd, Liverpool L4 0TJ, UK'
	},
	{
		name: 'The Sandon',
		address: '178-182 Oakfield Rd, Liverpool L4 0UH, UK'
	},
	{
		name: 'The Park Pub',
		address: '216-218 Walton Breck Rd, Liverpool L4 0RQ, UK'
	},
	{
		name: 'The Twelfth Man',
		address: '121 Walton Breck Rd, Liverpool L4 0RD, UK'
	}
	];
	var googleMap = createMap();
	var infoWindow = new google.maps.InfoWindow();
	ko.applyBindings(new ViewModel(googleMap, myPlaces, infoWindow))
});
}

function populateInfoWindow(marker, infowindow) {
		       	
   	// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
   		infowindow.marker = marker;
      	infowindow.setContent('<div>' + marker.title + '</div>');
      	infowindow.open(map, marker);

      	// Make sure the marker property is cleared if the infowindow is closed.
      	infowindow.addListener('closeclick',function(){
        	infowindow.setMarker = null;
      	});
    }
}