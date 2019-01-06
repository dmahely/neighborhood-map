// global variables
let map;
let largeInfowindow;
let bounds;

// initializes a map via the google maps api
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.42830, lng: 18.771238},
		zoom: 10
	});

	largeInfowindow = new google.maps.InfoWindow();
	bounds = new google.maps.LatLngBounds();

	// starts the application's view model
	ko.applyBindings(new AppViewModel());
}

// the application's data model
let Location = function(data) {
	let self = this;

	this.title = data.title;
	this.position = data.location;

	this.marker = new google.maps.Marker({
		position: this.position,
		title: this.title,
		map: map,
		animation: google.maps.Animation.DROP,
	});

	/* extends the bounds of the map
	** i.e. its size to fit the map */
	bounds.extend(this.marker.position);
	map.fitBounds(bounds);

	// shows the location's marker on the map
	this.showMarker = function(isShown) {
		if(isShown) {
			this.marker.setMap(map);
			bounds.extend(this.marker.position);
			map.fitBounds(bounds);
		} else {
			this.marker.setMap(null);
		}
	};

	/* animates the marker and opens the infowindow
	** when a location is clicked on */
	this.setLocation = function(currentLocation) {
		populateInfoWindow(this.marker, largeInfowindow);
		map.panTo(this.marker.getPosition());
		animateMarker(this.marker);
	};

	this.marker.addListener('click', function() {
		populateInfoWindow(this, largeInfowindow);
		animateMarker(this);
		map.panTo(this.getPosition());
	});
}

// animates the marker by bouncing
function animateMarker(marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function() {
		marker.setAnimation(null)
	}, 900);
}
/* populates the infowindow using data
** received from an api call to foursquare */
function populateInfoWindow(marker, infowindow) {
	if(infowindow.marker != marker) {
		infowindow.setContent("");
		infowindow.marker = marker;
		// closes the infowindow
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});

		const apiClientId = "HEETPNDMW35BANJMNGM5UKQYNDTO5XJ5ISPU2UMH31DT0OFO";
		const apiClientSecret = "WHCG1CU03BVLV5WFFRCZ1OM0WGNYLCDPX01HYTTOS1PNIVPL";

		let infoWindowContent = "<div><b>" + marker.title + "</b></div>";

		let apiEndpoint = "https://api.foursquare.com/v2/venues/search?v=20161016&client_id=" + apiClientId + "&client_secret=" + apiClientSecret + "&ll=" + marker.position.lat() + "," + marker.position.lng() + "&query=" + marker.title;
		// api call
		$.getJSON(apiEndpoint).done(function(data) {
			if(data.response.venues) {
				let venue = data.response.venues[0];
				let venue_id = venue.id;
				let address = venue.location.formattedAddress;
				for(i = 0; i < address.length; i++) {
					infoWindowContent += address[i] + "<br/>";
				}
			}
		}).fail(function() {
			infoWindowContent = infoWindowContent + "<div> Cannot connect to Foursquare API</div>"
		}).always(function() {
			let attribution = "<div><a href='https://developer.foursquare.com/'> Powered by Foursquare</a></div>"
			infowindow.setContent(infoWindowContent + attribution);
		});

		// opens the infowindow of the marker
		infowindow.open(map, marker);
	}
}

function mapError() {
    alert('Unable to load Google Maps. Check your Internet connection.');
}

// the application's view model
function AppViewModel() {
	let self = this;

	this.locationsList = ko.observableArray([]);
	this.searchValue = ko.observable("");

	// adds each location in initialLocations.js to this view model's locationsList variable
	initialLocations.forEach(function(location) {
		self.locationsList.push(new Location(location));
	});

	/* filteres the locations according
	** to the entered search keyword and
	** returns only the matching locations */
	this.filteredList = ko.computed(function() {
		let filter = self.searchValue().toLowerCase();

		// if the input is empty
		if(!filter) {
			return self.locationsList();
		} else {
			return ko.utils.arrayFilter(self.locationsList(), function(location) {
				return location.title.toLowerCase().indexOf(filter) !== -1;
			});
		}
	});

	/* only shows the filtered locations'
	** markers and hides the rest */
	this.filteredList.subscribe(function (locations) {
		ko.utils.arrayForEach(self.locationsList(), function(location) {
			let isShown = false;
			for(let i = 0; i < locations.length; i++) {
				if(locations[i].title == location.title)
					isShown = true;
			}
			location.showMarker(isShown);
		});
	});
}