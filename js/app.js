let map;
let largeInfowindow;
let bounds;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.42830, lng: 18.771238},
		zoom: 10
	});

	largeInfowindow = new google.maps.Infowindow();
	bounds = new google.maps.LatLngBounds();

	ko.applyBindings(new ViewModel());

}

// view model
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
}

	const markers = [];
	for(let i = 0; i < initialLocations.length; i++) {
		const marker = new google.maps.Marker({
			position: initialLocations[i].location,
			map: map,
			title: initialLocations[i].title,
			animation: google.maps.Animation.DROP
		});

		markers.push(marker);
		marker.addListener('click', function() {
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function(){ marker.setAnimation(null); }, 800);
			}
		});
	}

// the application's view model
function AppViewModel() {
	this.result = ko.observable("This is what we want to show up");
	this.searchValue = ko.observable("");
}

ko.applyBindings(new AppViewModel());