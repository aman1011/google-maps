
var ViewModel = function (googleMap, myPlaces, infoWindow, bounds) {

	var self = this;

	this.map = googleMap;
	this.allPlaces = ko.observableArray([]);
	this.markers = [];
	this.timeInfoHeading = ko.observable('');
	this.timeInfo = ko.observableArray([]);
	this.userInput = ko.observable('');
	var geocoder = new google.maps.Geocoder();
	myPlaces.forEach(function(place) {
		var newObj = new Place(place);
		var title = newObj.name;

		// Getting the geocode for the place.
		geocoder.geocode({ 'address': place.address }, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				marker = new google.maps.Marker({
					map: self.map,
					position: results[0].geometry.location,
					animation: google.maps.Animation.DROP,
					title: title,
					address: newObj.address
				});

				self.markers.push(marker);

				(function (marker, title) {
					 google.maps.event.addListener(marker, 'click', function () {

						toggleBounce(marker);
						populateinfoWindow(marker, infoWindow);
						timeInformation(self);
					 });
				})(marker, title);

				bounds.extend(marker.position);
			} else {
				alert('The google geocoder API failed to get the map info.Please try again in some time !!');
			}
		});
		self.allPlaces.push(newObj);
	});

	// function to set the current place.
	this.clearAllMarkers = function() {
		for( var i = 0; i < self.markers.length; i++) {

			// Making all markers disappear
			self.markers[i].setVisible(false);
		}
	}

	this.setCurrentPlace = function(place) {
		for( var i = 0; i < self.markers.length; i++) {

			// Clearing away the existing bouncing animation.
			self.markers[i].setAnimation(null);
			if (place.name == self.markers[i].title) {
				self.markers[i].setVisible(true);
				toggleBounce(self.markers[i]);
				(function (marker, title) {
					infoWindow.close();
					 google.maps.event.addListener(marker, 'click', function () {
					 	toggleBounce(marker);
						populateinfoWindow(marker, infoWindow);
						timeInformation(self);
					 });
				 })(marker, place.name);

				 bounds.extend(self.markers[i].position);
			}
		}
	}

	// filtering places
	console.log(self.allPlaces()[0].name);
	
	this.searchedPlace = ko.computed(function() {
		console.log('reaching in computed search place');
		console.log(self.userInput());
		// clearing all markers.
		self.clearAllMarkers();

		for (var i = 0; i < self.markers.length; i++) {

			// check if its a substring.
			if (self.markers[i].title.toLowerCase().indexOf(self.userInput().toLowerCase()) !== -1) {

				// Showing markers.
				self.allPlaces.push(new Place({name: self.markers[i].title, address: self.markers[i].address}));
				self.markers[i].setVisible(true);
			}
		}
	});

	// getting time info as a KO Observable.
}

var Place = function(data) {
	this.name = data.name;
	this.address = data.address;
}

var createMap = function () {
	var map;

	// Constructor creates a new map - only center and zoom are required.
	// Centering map at Anfield.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 53.4308294, lng: -2.96083},
		mapTypeControl: false,
		zoom: 15
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
	var bounds = new google.maps.LatLngBounds();
	ko.applyBindings(new ViewModel(googleMap, myPlaces, infoWindow, bounds))
});
}

function populateinfoWindow(marker, infoWindow) {
				
				console.log('reach here');
	// Check to make sure the infoWindow is not already opened on this marker.
	if (infoWindow.marker != marker) {
		infoWindow.marker = marker;
		infoWindow.setContent('<div id="text">' + marker.title + '</div>' + '<div id="text">' + marker.address + '</div>');
		infoWindow.open(map, marker);

		// Make sure the marker property is cleared if the infoWindow is closed.
		infoWindow.addListener('closeclick',function(){
			infoWindow.setMarker = null;
			infoWindow.marker = null;

		});

		// Get the street View for the place.
		var streetView = new google.maps.StreetViewService();
		var radius = 50;

		function getStreetView(data, status) {

			// Check if the status of the google service is OK.
			// In case it's ok, then proceed with the panorama view.
			if( status == google.maps.StreetViewStatus.OK ) {

				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
				infoWindow.setContent( '<div>'+ marker.title + '<div id="pano"></div');
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
				infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
			}
		}

		// Calling the above function with the marker data.
		streetView.getPanoramaByLocation(marker.position, radius, getStreetView);
		infoWindow.open(map, marker);
	}
}

function timeInformation(viewModel) {
	var foundFlag = false;

	// Resetting the time information.
	viewModel.timeInfo.removeAll();
	// Making the ajax call to get the information from the 
	// four square to get the venue id, which will be later used
	var request_url = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.position.lat() + ',' + marker.position.lng() + '&client_id=KXTPUTXWJXUUUE22RHHQ3YNYEGZHBG31AXS0CFOHWL3AHANU&client_secret=3IF050LBAUYMCD1UV55HV2IAA1WOLR3NFMWYOAVYUVCNU5U2&v=20171127';
	$.ajax({
		url: request_url,
		success: function (data) {
			var venues = data.response.venues;
			for (var i = 0; i < venues.length; i++) {
				if (venues[i].name.toLowerCase().indexOf(marker.title.toLowerCase()) !== -1) {

					var foundFlag = true;
					viewModel.timeInfoHeading('Open Timings');
					// we have reached in our pub.
					// Now remains to find the open and close time
					// This will be done via another ajax call to 
					// another four square API.
					timeUrl = 'https://api.foursquare.com/v2/venues/' + venues[i].id + '/hours?client_id=KXTPUTXWJXUUUE22RHHQ3YNYEGZHBG31AXS0CFOHWL3AHANU&client_secret=3IF050LBAUYMCD1UV55HV2IAA1WOLR3NFMWYOAVYUVCNU5U2&v=20171127';
					$.ajax({
						url: timeUrl,
						success: function (data) {
							var timeFrames = data.response.popular.timeframes;
							var timeContent = '';
							if( timeFrames ) {
								for (var j = 0; j < timeFrames.length; j++) {

									// Adding the full address.
									// creating a switch case.
									var textDay;
									switch(timeFrames[j].days[0]) {
										case (1):
											textDay = 'Monday';
										break;

										case 2:
											textDay = 'Tuesday';
										break;

										case 3:
											textDay = 'Wednesday';
										break;

										case 4:
											textDay = 'Thursday';
										break;

										case 5:
											textDay = 'Friday';
										break;

										case 6:
											textDay = 'Saturday';
										break;

										case 7:
											textDay = 'Sunday';
										break;
										default: 'Weird day';
									}

									var openHours = textDay+ ': ';
									for (var k = 0; k < timeFrames[j].open.length; k++) {
										openHours += timeFrames[j].open[k].start + ' - ' + timeFrames[j].open[k].end + ', ';

										//Removing the + character representing AM.
										openHours = openHours.replace('+', '');
									}

									viewModel.timeInfo.push({day: openHours});

								}
							}
						},
						error: function (e) {
							viewModel.timeInfo('Could not find timing for the resturant through fourSquare' + "\n");
						}
					});
					break;
				} 
			}
			if (!foundFlag) {
				viewModel.timeInfo('Could not find the restaurant via fourSquare API' + "\n");
			}
		},
		error: function(e) {
			viewModel.timeInfo('Could not find the restaurant via fourSquare API' + + "\n");
		}
	});
}


function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

