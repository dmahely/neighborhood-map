function initMap() {
	const map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 42.42830, lng: 18.771238},
		zoom: 10
	});

	const initialLocations = [
{title: 'Cats Museum', location: {lat: 42.425080, lng: 18.770212} },
{title: 'Maritime Museum', location: {lat: 42.425007, lng: 18.771327} },
{title: 'Kotor Fortress', location: {lat: 42.422094, lng: 18.774576} },
{title: 'Our Lady of the Rocks', location: {lat: 42.486906, lng: 18.688731} },
{title: 'State Park', location: {lat: 42.257430, lng: 18.893081} },
{title: 'Church of the Holy Spirit', location: {lat: 42.425367, lng: 18.770767} },
{title: 'Budva Old Town', location: {lat: 42.278277, lng: 18.837687} },
{title: 'Budva Old Town Beach', location: {lat: 42.277909, lng: 18.836928} },
{title: 'Roman Villa remains', location: {lat: 42.278184, lng: 18.838189} },
{title: 'Skadar Lake National Park', location: {lat: 42.247589, lng: 19.217259} },
{title: 'Lovcen National Park', location: {lat: 42.397654, lng: 18.843244} }
];


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
}