/*
----------------------ADD LISTENERS
*/
//listeners for tabs
document.getElementById('findYums').addEventListener('click', hideListings);
document.getElementById('defaultOpen').addEventListener('click', showListings);

//listeners for setting route and finding locations near route
document.getElementById('input-home').addEventListener('keypress', function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        setHome();
    }
});

document.getElementById('input-dest').addEventListener('keypress', function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        setDest();
    }
});

//listeners for filtering locations
document.getElementById('showAll').addEventListener('click', showListings);
document.getElementById('showDining').addEventListener('click', function() {
    filterMarkers('dining');
}, false);
document.getElementById('showCafe').addEventListener('click', function() {
    filterMarkers('cafe');
}, false);


/*
-----------------SEARCH FOR FOOD NEAR ROUTE FUNCTIONS
*/

//function for filtering markers nearby
function findYummy(miAway) {
    //clear all the circles on the map
    clearCircles();

    if (miAway !== null) {
        //draw a circle on the home and destination
        drawPoly(home.marker.position, miAway, 0);
        drawPoly(dest.marker.position, miAway, 1);

        //get the path for the polyline
        var pathArray = polyline.getPath().getArray();
        var increment = miAway * miAway * 10;

        //go through path and draw circle on increments
        for (var i = 2; i < pathArray.length; i += increment) {
            drawPoly(pathArray[i], miAway, i);
        }
        searchLocations();
    }
}

//searches and display markers that are within the circles along the path
function searchLocations() {
    //make sure all the listings are not showing
    hideListings();

    //go through each marker
    for (var i = 0; i < markers.length; i++) {

        //check if the marker is within the the circles
        for (var a = 0; a < yumPoly.length; a++) {
            if (yumPoly[a] != null) {
                //get bounds of all polygons and check whether markers are inside
                var circle = yumPoly[a].getBounds();
                var withinBool = circle.contains(locations[i].marker.position);
                if (withinBool === true) {
                    markers[i].setMap(map);
                    break;
                }
            }
        }
    }
}
/*
-----------------DRAWING ON THE MAP
*/

//create polygon array
var yumPoly = [];

//draws circles based on center location, radius-- put in array
function drawPoly(center, miAway, i) {

    var radius = 1609 * miAway;
    yumPoly[i] = new google.maps.Circle({
        strokeOpacity: 0,
        fillColor: '#8ab366',
        fillOpacity: 0.1,
        map: map,
        center: center,
        radius: radius
    });
}

//remove circles from map
function clearCircles() {
    if (yumPoly !== '') {
        for (var i = 0; i < yumPoly.length; i++) {
            if (yumPoly[i] != null) {
                yumPoly[i].setMap(null);
            }
        }
        //clear array
        yumPoly = [];
    }
}

/*
----------------------functions for DISPLAYING ROUTE
*/

var home = [{
    address: '',
    marker: ''
}];
var dest = [{
    address: '',
    marker: '',
}];
var polyline;

//get home value and put it on the map
function setHome() {

    if (home != null && home != undefined) {
        clearHome();
        clearPolyline();
    }

    if (document.getElementById('input-home').value !== '') {
        home.address = document.getElementById('input-home').value + " Florida";
        setMarker(home.address, "home");
    }

    if (dest.marker != null) {
        displayPath();
        resetDropdown();
    }

}

//get destination value and put it on the map
function setDest() {

    if (dest != null && dest != undefined) {
        clearDest();
        clearPolyline();
    }

    if (document.getElementById('input-home').value !== '' && home !== null) {
        dest.address = document.getElementById('input-dest').value + " Florida";
        setMarker(dest.address, "dest");
        displayPath();
        resetDropdown();
    }
}

function resetDropdown() {
    var dropDown = document.getElementById("milesDrop");
    dropDown.selectedIndex = 0;
}

//function for putting markers on home and dest
function setMarker(address, name) {
    // Initialize the geocoder.
    var geocoder = new google.maps.Geocoder();

    // Geocode the address/area entered and place a marker
    geocoder.geocode({
        address: address,
    }, function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            if (name == 'home') {
                icon = "images/home_pin.png";
                home.marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: icon,
                    map: map
                });
            } else if (name == 'dest') {
                icon = "images/dest_pin.png";
                dest.marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: icon,
                    map: map
                });
            }
        } else {
            window.alert('We could not find that location - try entering a more' +
                ' specific place.');
        }
    });

}

function clearRoute() {
    clearPolyline();
    clearHome();
    clearDest();
}

function clearPolyline() {
    if (polyline != null) {
        polyline.setMap(null);
        polyline = null;
    }
}

function clearHome() {
    if (home.marker !== null && home.marker !== undefined) {
        home.marker.setMap(null);
        home = [];
    }
}

function clearDest() {
    if (dest.marker !== null && dest.marker !== undefined) {
        dest.marker.setMap(null);
        dest = [];
    }
}

//function for displaying the route
function displayPath(origin) {
    // hideMarkers(markers);
    clearCircles();
    hideListings();

    var directionsService = new google.maps.DirectionsService();
    // Get the destination address from the user entered value.
    var destinationAddress = dest;

    var request = {
        origin: home.address,
        destination: dest.address,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    if (polyline != undefined) {
        polyline.setMap(null);
    }

    polyline = new google.maps.Polyline({
        path: [],
        strokeColor: '#D47444',
        strokeWeight: 3
    });

    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var bounds = new google.maps.LatLngBounds();
            var path = result.routes[0].overview_path;
            var legs = result.routes[0].legs;
            for (i = 0; i < legs.length; i++) {
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k = 0; k < nextSegment.length; k++) {
                        polyline.getPath().push(nextSegment[k]);
                        bounds.extend(nextSegment[k]);
                    }
                }
            }
            polyline.setMap(map);
            map.fitBounds(bounds);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}


/*
----------------DISPLAYING markers
*/

// This function will loop through the markers array and display them all.
function showListings() {
    hideListings();
    clearCircles();
    clearRoute();

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


//info to put in infowindow
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div><strong>' + marker.title + '</strong></div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
            infowindow.marker = '';
            marker.setAnimation(google.maps.Animation.NULL);
        });

        var request = {
            location: marker.position,
            radius: '500',
            query: marker.title
        };

        var service = new google.maps.places.PlacesService(map);

        service.textSearch(request, callback);

        //if request is successful..
        function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var reference = results[0].place_id;
                service.getDetails({
                    placeId: reference
                }, function(place, status) {

                    if (status === google.maps.places.PlacesServiceStatus.OK && place.opening_hours != undefined) {
                        //get information about the location
                        var hours = place.opening_hours.weekday_text;

                        var place_open = place.opening_hours.open_now;

                        var rating = place.rating * 20 + "%";

                        var open;
                        if (place_open == true) {
                            open = "Open Now";
                        } else if (place_open == false) {
                            open = "Closed Now";
                        }

                        var price;

                        if (place.price_level != undefined) {
                            price = '';
                            for (var i = 0; i < place.price_level; i++) {
                                price += '$';
                            }
                        } else {
                            price = " ";
                        }

                        //format marker latlong for Foursquare API search
                        var markerPos = marker.position.toString();
                        ll = markerPos.replace('(', '').replace(')', '').replace(' ', '');

                        var apiURL = "https://api.foursquare.com/v2/venues/";
                        var clientID = "K4XHVBDMECULARNAZZRQJ1CXLRZG5MLK2MXLTCL5WRTTNM3P";
                        var clientSecret = "1S31LQBUPNGW5SASGRQ2BTRKFZLOQOV0DXJIVQCHEMI4ZE3S";
                        var version = "20170425";
                        var foursquareSearch = apiURL + "search?ll=" + ll + "&query=" + marker.title + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=' + version;
                        var foursquareLink;

                        function linktoFoursquare(url) {
                            foursquareLink = url;
                        }

                        $.ajax({
                            url: foursquareSearch,
                            success: function(data) {
                                //find the Foursquare ID of the venue if the search is successful
                                var venueFoursquareID = data.response.venues[0].id;

                                var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=' + version;

                                $.ajax({
                                    url: foursquareURL,
                                    //find the link of the venue if the search is successful
                                    success: function(data) {
                                        linktoFoursquare(data.response.venue.shortUrl);

                                        infowindow.setContent(
                                            '<div id = "marker_title"><strong>' + marker.title + '</div></strong><div>' +
                                            price + '</div><div class="star-ratings-css"><div class="star-ratings-css-top" style="width:' + rating + '"><span>' +
                                            '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' +
                                            '</span></div><div class="star-ratings-css-bottom"><span>' +
                                            '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' + '</span><span>' + '&#9733;' +
                                            '</span></div></div><div id = "open">' + open + '</div><div>' + hours[0] + '</div><div>' + hours[1] + '</div><div>' +
                                            hours[2] + '</div><div>' + hours[3] + '</div><div>' + hours[4] + '</div><div>' + hours[5] + '</div><div>' + hours[6] +
                                            '</div><a href ="' + foursquareLink + '">' + '<img src=images/foursquare_logo.png id= "foursquare"></a>');
                                    },
                                    error: function() {
                                        infowindow.marker = null;
                                        alert("place not found");
                                    }
                                });

                            }
                        });

                    }
                });
            } else {
                infowindow.marker = null;
                alert("place not found");
            }
        }

    }
}
