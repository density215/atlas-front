/*
 * AtlasMap is a module that allows for loading probe-data over batched API calls.
 * It will load and render probes on initMap()
 *
 * Works on maps in tabs.
 *
 * Needs html structure:
 *
 * <div id="map>
 *     <div id="map-canvas"></div>
 * </div>
 *
 */
import React from 'react';
import {json} from 'd3-request';
import {select} from 'd3-selection';
import {geoPath, geoOrthographic, geoGraticule, geoDistance} from 'd3-geo';
import topojson from 'topojson';

export class AtlasMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scale: props.scale
        };
    }

    zoomIn() {
        this.setState({
            scale: this.state.scale * 2
        });
    }

    zoomOut() {
        this.setState({
            scale: this.state.scale / 2
        });
    }

    render() {

        var width = 650;
        var height = 932;
        // set your zoom scale
        var scale = (1 << 18);
        // min and max of your zoom scale
        var scaleExtent = [450, 1500];
        // set your center point
        var center = [122, 3.5];
        // set your popupContent
        var zoomIn = this.zoomIn,
            zoomOut = this.zoomOut,
            popupContent = function (d) {
                return d.properties.text;
            },
            onMarkerMouseOut = function (component, d, i) {
                console.log('out')
            },
            onMarkerMouseOver = function (component, d, i) {
                console.log('over')
            },
            onMarkerClick = function (component, d, i) {
                component.showPopup();
                console.log('click')
            },
            onMarkerCloseClick = function (component, id) {
                component.hidePopup();
                console.log('close click')
            };
        var data = {
            "type": "Feature",
            "properties": {
                "text": "Somewhere in Australia"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [122, -23.5]
            }
        };

        return (
            <div className="mapContainer">
            </div>
        )
    }
}

export default function testMap() {

    var width = 800,
        height = 932;

    var m0, o0;

    var svg = select(".mapContainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on('mousedown', mousedown)
        .on('mousemove', mousemove)
        .on('mouseup', mouseup);

    var projection = geoOrthographic()
        .scale(333)
        .translate([width / 2, height / 2])
        .precision(0.2)
        .clipAngle(90);

    var path = geoPath()
        .projection(projection)
        .pointRadius(1.5);

    var graticule = geoGraticule();

    function position_labels() {
        var centerPos = projection.invert([width / 2, height / 2]);

        svg.selectAll(".place-label")
            .attr("text-anchor", function (d) {
                var x = projection(d.geometry.coordinates)[0];
                return x < width / 2 - 20 ? "end" :
                    x < width / 2 + 20 ? "middle" :
                        "start"
            })
            .attr("transform", function (d) {
                var loc = projection(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                var offset = x < width / 2 ? -5 : 5;
                return "translate(" + (x + offset) + "," + (y - 2) + ")"
            })
            .style("display", function (d) {
                var d = geoDistance(d.geometry.coordinates, centerPos);
                return (d > 1.57) ? 'none' : 'inline';
            });
    }

    function mousedown() {
        m0 = [event.pageX, event.pageY];
        o0 = projection.rotate();
        event.preventDefault();
    }

    function mousemove() {
        if (m0) {
            var m1 = [event.pageX, event.pageY]
                , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
            o1[1] = o1[1] > 30 ? 30 :
                o1[1] < -30 ? -30 :
                    o1[1];
            projection.rotate(o1);
            refresh();
        }
    }

    function mouseup() {
        if (m0) {
            mousemove();
            m0 = null;
        }
    }

    function refresh() {
        //svg.selectAll(".land").attr("d", path);
        svg.selectAll(".land").attr("d", path);
        svg.selectAll(".graticule").attr("d", path);
        svg.selectAll(".place").attr("d", path);
        position_labels();
    }

    json("maps/countries_topo.json", function (error, countries) {
        if (error) return console.error(error);
        var countries_map = topojson.feature(countries,
            countries.objects.countries_50m
        );
        var places = countries.objects.populated_places_50m;
        places.geometries = countries.objects.populated_places_50m.geometries.filter(
            (place) => {
                return place.properties.scalerank < 2;
            }
        );

        var places_map = topojson.feature(countries, places);

        // Oceans and shading

        var ocean_fill = svg.append("defs").append("radialGradient")
            .attr("id", "ocean_fill")
            .attr("cx", "75%")
            .attr("cy", "25%");
        ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#ddf");
        ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#9ab");

        var globe_highlight = svg.append("defs").append("radialGradient")
            .attr("id", "globe_highlight")
            .attr("cx", "75%")
            .attr("cy", "25%");

        globe_highlight.append("stop")
            .attr("offset", "5%").attr("stop-color", "#ffd")
            .attr("stop-opacity", "0.6");

        globe_highlight.append("stop")
            .attr("offset", "100%").attr("stop-color", "#2eaad3")
            .attr("stop-opacity", "0.2");

        var globe_shading = svg.append("defs").append("radialGradient")
            .attr("id", "globe_shading")
            .attr("cx", "50%")
            .attr("cy", "40%");

        globe_shading.append("stop")
            .attr("offset", "50%").attr("stop-color", "#9ab")
            .attr("stop-opacity", "0");

        globe_shading.append("stop")
            .attr("offset", "100%").attr("stop-color", "#3e6184")
            .attr("stop-opacity", "0.3");

        svg.append("circle")
            .attr("cx", width / 2).attr("cy", height / 2)
            .attr("r", projection.scale())
            .attr("class", "noclicks")
            .style("fill", "url(#ocean_fill)");

        svg.append("circle")
            .attr("cx", width / 2).attr("cy", height / 2)
            .attr("r", projection.scale())
            .attr("class", "noclicks")
            .style("fill", "url(#globe_shading)");

        svg.append("circle")
            .attr("cx", width / 2).attr("cy", height / 2)
            .attr("r", projection.scale())
            .attr("class", "noclicks")
            .style("fill", "url(#globe_highlight)");


        // end oceans and shading

        /* svg.append("path")
         .datum(countries_map)
         .attr("class", "land")
         .attr("d", path); */

        svg.selectAll(".country")
            .data(countries_map.features)
            .enter().append('path')
            .attr('class', function (d) {
                return "land country_" + d.id;
            })
            .attr('d', path);

        svg.append("path")
            .datum(places_map)
            .attr('d', path)
            .attr('class', 'place');

        svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);

        svg.selectAll(".place-label")
            .data(places_map.features.filter(function (f) {
                return f.properties.scalerank < 2;
            }))
            .enter().append("text")
            .attr("class", function (d) {
                return "place-label rank_" + d.properties.scalerank;
            })
            .attr("transform", function (d) {
                return "translate(" + projection(d.geometry.coordinates) + ")";
            })
            .attr("dy", "2em")
            .attr("dx", "0")
            .text(function (d) {
                return d.properties.name;
            });

        position_labels();
    });
}
/*export function AtlasMap (spec) {
 var _public = {
 /!* probes:
 * - loadedProbes: holds the probes that where successfully loaded in an ajax batch call.
 * - textStatus: holds the xhr.textStatus in case of a (network) error.
 *!/
 probes: {
 loadedProbes: undefined
 },
 // The object to hold the leaflet map
 map: undefined,
 // event that is triggered when all probes are loaded in probes.loadedProbes
 probesLoadedEvent: document.createEvent('Event'),
 /!* initMap:
 * initializes the map and makes sure it gets rerendered after finishing loading the tiles,
 * this is important in case of a map that's rendered in a map.
 * it starts loading the probes AFTER the tiles are ready.
 *!/
 initMap: function (spec) {
 var osmMap = L.tileLayer(
 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
 {
 minZoom: 1,
 maxZoom: 13,
 attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
 });
 // hold the urls for the markers on the map, should be passed in by client
 _public.markers = spec.markers;
 if (!_public.map) {
 _public.map = L.map('map-canvas').setView(centre, 2);
 _public.probesLoadedEvent.initEvent('probesloaded', true, true);
 }

 _public.map.once('layeradd', function (l) {
 console.log('layer loaded...');
 _public.map.invalidateSize(false);
 document.getElementById('map').addEventListener('probesloaded', probesLoadedHandler);
 loadProbes();
 });

 _public.map.addLayer(osmMap);
 },
 set_message: function (spec) {
 var title = spec.title,
 body = spec.body;

 message_elm = document.createElement('div');
 message_elm.classList.add('panel');
 message_elm.classList.add('panel-default');
 message_pane = document.createElement('div');
 message_pane.innerText = body;
 message_pane.className = 'panel-body';
 message_elm.appendChild(message_pane);
 message_elm.style.display = 'table';
 document.getElementById('map-canvas').appendChild(message_elm);
 }
 },

 // Private Methods
 centre = [0, 0],
 probesLoadedHandler = function (e) {
 // Handler for the 'loadedprobes' event that redraws the map to fit all loaded probes in
 console.log('probes loaded...');
 document.removeEventListener(e.type, arguments.callee);
 var bounds = _public.probes.loadedProbes.filter(function (p) {
 return p.geometry
 }).map(function (p) {
 return [p.geometry.coordinates[1], p.geometry.coordinates[0]];
 });
 if (bounds.length > 0) {
 _public.map.fitBounds(bounds, {maxZoom: 7});
 _public.map.invalidateSize(false);
 }
 else {
 _public.set_message({title: 'Warning', body: 'No probes can be located'});
 }
 },

 loadProbes = function () {
 if (!_public.probes.loadedProbes) {
 _public.probes.loadedProbes = [];
 loadBatch(Atlas.urls.api.cartography.locations + "?optional_fields=country_name,owner&page_size=50");
 }
 function loadBatch(pageUrl) {
 $.ajax({
 url: pageUrl,
 method: 'GET',
 dataType: 'json'
 }).then(
 function (probesResult) {
 _public.probes.loadedProbes = _public.probes.loadedProbes.concat(probesResult.results);
 probesResult.results.map(function (probe) {
 drawProbe(probe);
 });
 nextBatchUrl = probesResult.next;
 if (nextBatchUrl) {
 loadBatch(nextBatchUrl);
 }
 else {
 document.getElementById('map').dispatchEvent(_public.probesLoadedEvent);
 return false;
 }
 },
 function (xhr, textStatus) {
 _public.set_message({title: 'Error', body: 'Error reading probe data'});
 console.log('error reading probe data');
 _public.probes.testStatus = textStatus;
 }
 );
 }
 },

 hooverTemplate = function (spec) {
 ip_v4 = spec.address_v4 ? 'ip v4\t\t: ' + spec.address_v4 + "\n" : "";
 ip_v6 = spec.address_v6 ? 'ip v6\t\t: ' + spec.address_v6 + "\n" : "";
 asn_v4 = spec.asn_v4 ? 'asn (v4)\t: ' + spec.asn_v4 + "\n" : "";
 asn_v6 = spec.asn_v6 ? 'asn (v6)\t: ' + spec.asn_v6 + "\n" : "";
 owner = (spec.owner !== null ? spec.owner : 'unknown') + "\n";
 return 'id\t\t: ' + spec.id + '\n' +
 'status\t: ' + spec.status.name + '\n' +
 ip_v4 +
 ip_v6 +
 asn_v4 +
 asn_v6 +
 'owner\t: ' + owner +
 'country\t: ' + spec.country_name
 },

 drawProbe = function (ProbeData) {
 var lat = ProbeData.geometry && ProbeData.geometry.coordinates[1],
 lon = ProbeData.geometry && ProbeData.geometry.coordinates[0],
 title = hooverTemplate(ProbeData);

 if (lat && lon) {
 var icon = L.icon({
 iconUrl: markers[ProbeData.status.name] || markers.default,
 iconSize: [22, 26],
 iconAnchor: [22, 26]
 });
 _public.map.addLayer(L.marker([lat, lon], {icon: icon, title: title}));
 }
 else {
 console.log("couldn't render probe id " + ProbeData.id + " (no geometry)");
 }
 };

 return _public;
 }();*/
