let map;
let largeInfowindow;
let bounds;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.42830, lng: 18.771238},
		zoom: 10
	});

	largeInfowindow = new google.maps.InfoWindow();
	bounds = new google.maps.LatLngBounds();

	ko.applyBindings(new AppViewModel());
}

// data model
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

	bounds.extend(this.marker.position);
	map.fitBounds(bounds);

	this.showMarker = function(show) {
		if(show) {
			this.marker.setMap(map);
			bounds.extend(this.marker.position);
			map.fitBounds(bounds);
		} else {
			this.marker.setMap(null);
		}
	};

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

function animateMarker(marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function() {
		marker.setAnimation(null)
	}, 900);
}

function populateInfoWindow(marker, infowindow) {
	if(infowindow.marker != marker) {
		infowindow.setContent("");
		infowindow.marker = marker;
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});

		const apiClientId = "HEETPNDMW35BANJMNGM5UKQYNDTO5XJ5ISPU2UMH31DT0OFO";
		const apiClientSecret = "WHCG1CU03BVLV5WFFRCZ1OM0WGNYLCDPX01HYTTOS1PNIVPL";

		let infoWindowContent = "<div>" + marker.title + "</div>";

		let apiEndpoint = "https://api.foursquare.com/v2/venues/search?v=20161016&client_id=" + apiClientId + "&client_secret=" + apiClientSecret + "&ll=" + marker.position.lat() + "," + marker.position.lng() + "&query=" + marker.title;

		$.getJSON(apiEndpoint).done(function(data) {
			if(data.response.venues) {
				let venue = data.response.venues[0];
				let venue_id = venue.id;
				let address = venue.location.formattedAddress;
				for(i = 0; i < address.length; i++) {
					infoWindowContent = infoWindowContent + "<br/>" + address[i];
				}
			}
		}).fail(function() {
			infoWindowContent = infoWindowContent + "<div> Cannot connect to Foursquare API</div>"
		});

		infowindow.open(map, marker);
	}
}

// the application's view model
function AppViewModel() {
	let self = this;

	this.locationsList = ko.observableArray([]);
	this.searchValue = ko.observable("");

	initialLocations.forEach(function(location) {
		self.locationsList.push(new Location(location));
	});

	this.filteredList = ko.computed(function() {
		let filter = self.searchValue().toLowerCase();

		if(!filter) {
			return self.locationsList();
		} else {
			return ko.utils.arrayFilter(self.locationsList(), function(location) {
				return location.title.toLowerCase().indexOf(filter);
			});
		}
	});

	this.filteredList.subscribe(function (locations) {
		ko.utils.arrayForEach(self.locationsList(), function(location) {
			let show = false;
			for(let i = 0; i < locations.length; i++) {
				show = true;
			}
			location.showMarker(show);
		});
	});
}