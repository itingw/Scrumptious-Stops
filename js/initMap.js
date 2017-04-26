var map;

// Create blank array for markers
var markers = [];

/*
----------------MAP DISPLAY AND STYLES
*/

function initMap() {
    var styles = [{
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                    "visibility": "simplified"
                },
                {
                    "hue": "#0066ff"
                },
                {
                    "saturation": 74
                },
                {
                    "lightness": 100
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                    "visibility": "off"
                },
                {
                    "weight": 0.6
                },
                {
                    "saturation": -85
                },
                {
                    "lightness": 61
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "on"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.local",
            "elementType": "all",
            "stylers": [{
                "visibility": "on"
            }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                    "visibility": "simplified"
                },
                {
                    "color": "#5f94ff"
                },
                {
                    "lightness": 26
                },
                {
                    "gamma": 5.86
                }
            ]
        }
    ];

    // Create new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.2631998,
            lng: -81.0062051
        },
        zoom: 10,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styles
    });

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = "images/pin.png";

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = "images/pin_nom.png";

    var infoWindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;


        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i

        });

        locations[i].marker = marker;

        marker.addListener('click', function() {
            toggleBounce(this);
            populateInfoWindow(this, infoWindow);
        });

        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

        // Push the marker to our array of markers.
        markers.push(marker);

    }

    //make the markers bounce
    function toggleBounce(marker) {
        for (var i = 0; i < locations.length; i++) {
            markers[i].setAnimation(google.maps.Animation.NULL);
        }
        marker.setAnimation(google.maps.Animation.BOUNCE);

    }

    showListings();


    /*
    ----------------KNOCKOUT list of places
    */

    //bind location data
    var yumPlace = function(data) {
        this.title = ko.observable(data.title);
        this.type = ko.observable(data.type);
        this.marker = ko.observable(data.marker);
    };

    var ListViewModel = function() {
        var self = this;
        //store list from data.js
        self.yumList = ko.observableArray([]);

        //store locations array into yumList observable arrayFilter
        for (var i = 0; i < locations.length; i++) {
            self.yumList.push(new yumPlace(locations[i]));
        }

        //store current filter
        self.currentFilter = ko.observable();

        //return different lists for filter
        self.filterList = ko.computed(function() {
            //return the whole list if no filter
            if (!self.currentFilter()) {
                return self.yumList();
            } else {
                return ko.utils.arrayFilter(self.yumList(), function(location) {
                    return location.type() == self.currentFilter();
                });
            }
        });

        //set the current filter
        self.filter = function(type) {
            self.currentFilter(type);
        };

        self.selectListLocation = function(clicked) {
            google.maps.event.trigger(clicked.marker(), 'click');
        };

    };

    ko.applyBindings(new ListViewModel());

}

//filter markers when icon is clicked
function filterMarkers(type) {
    hideListings();
    for (var i = 0; i < locations.length; i++) {
        if (locations[i].type === type) {
            markers[i].setMap(map);
        } else {
            markers[i].setMap(null);
        }
    }
}
