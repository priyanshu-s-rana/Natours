var L = require('leaflet');
// if(map_box)
const map_func = (locations)=>{
    // const locations = JSON.parse(map_box.dataset.locations);

    //! Map styles that I like
    // 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}'
    // 'https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}'
    //       attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //       minZoom: 0,
    //       maxZoom: 22,
    //       accessToken: '<your accessToken>'
    // 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'
    // 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    //! Jawg.io
    // L.tileLayer(`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=TQ0QhCYiaJGKqXGy6vJYVAHanJtRFP2z3I3O1MvtW9ubmX2F2KJuH49AeDAxGSqa`, {
    //     attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // 	minZoom: 0,
    // 	maxZoom: 22,
    // 	accessToken: `TQ0QhCYiaJGKqXGy6vJYVAHanJtRFP2z3I3O1MvtW9ubmX2F2KJuH49AeDAxGSqa`
    // }).addTo(map);
    var map = L.map('map').setView([34.072038,-118.336686],9,{
        scrollWheelZoom : false 
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 15,
    }).addTo(map);

    var myIcon = L.icon({
        iconUrl: '/img/pin.png',
        iconSize: [30, 35],
        iconAnchor: [22, 35],
        popupAnchor: [-3, -76],
    });

    var bounds = [[]];
    // var loc = {};
    // for(var i =0;i<locations.length;i++){
    //    loc[i] =  L.marker(locations[i].coordinates.reverse(),{
    //         icon : myIcon
    //     }).bindPopup(`This is ${locations[i].description}`);
    // }

    locations.forEach(loc=>{
        //! Adding a marker
        // const el = document.createElement('div');
        // el.className = 'marker';
        loc.coordinates.reverse();
        L.marker(loc.coordinates,{
            icon:myIcon,
            title : `Day ${loc.day} : ${loc.description}`
        }).bindPopup(`Day ${loc.day} : ${loc.description}`,{autoClose :false,closeOnClick:false}).addTo(map);

        new L.popup(loc.coordinates,{
            offset : [-7,-15],
            autoClose : false,
        })
        .setContent(`Day ${loc.day} : ${loc.description}`)
        .openOn(map);

        if(bounds[0].length === 0) bounds.pop();
        bounds.push(loc.coordinates);
    })
    // bounds.reverse();
    // bounds.pop();
    // console.log(bounds);
    map.fitBounds(bounds,{
        // paddingBottomRight : [200,100],
        // paddingBottomRight : [200,100],
        padding : [200,200]
    });
    // console.log(locations);
}

module.exports = map_func
