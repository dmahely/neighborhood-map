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
}