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
import {Map, MarkerGroup} from 'react-d3-map';
import {ZoomControl} from 'react-d3-map-core';

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
                <Map projection="mercator"
                     height={height}
                     width={width}
                     scale={scale}
                     center={center}
                     scaleExtent={scaleExtent}
                     zoomScale={this.state.scale}
                     center={center}>
                    <MarkerGroup key={"marker-test"}
                                 data={data}
                                 popupContent={popupContent}
                                 onClick={onMarkerClick}
                                 onCloseClick={onMarkerCloseClick}
                                 markerClass={"marker-class"}/>
                </Map>
                <ZoomControl
                    zoomInClick={zoomIn.bind(this)}
                    zoomOutClick={zoomOut.bind(this)}
                />
            </div>
        )
    }
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
