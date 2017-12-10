
var ViewModel = function (googleMap, myPlaces) {

	var self = this;

	self.map = googleMap;
	self.placeList = [];
    myPlaces.forEach(function(place) {
    	newObj = new Place(place);

    	// Getting the geocode for the place.
    	var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': place.address }, function(results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
        		newObj.marker = new google.maps.Marker({
            		map: self.map,
            		position: results[0].geometry.location,
            		animation: google.maps.Animation.DROP
        		});
    		}
		});
	    self.placeList.push(new Place(place));
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
	ko.applyBindings(new ViewModel(googleMap, myPlaces))
});
}