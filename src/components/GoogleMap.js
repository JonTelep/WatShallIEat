/*
Using google-maps-react in order to render google maps
reference doc located:
https://www.npmjs.com/package/google-maps-react
*/
import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

/* const receiveCoordinates =( {latitude, longitude }) => {

} */


export class MapContainer extends Component {
    state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},

     mapCenter: {
          lat: 40.854855,
          lng: -88.081807
      }  
    };
   
    onMarkerClick = (props, marker, e) =>
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true
      });
   
    onMapClicked = (props) => {
      if (this.state.showingInfoWindow) {
        this.setState({
          showingInfoWindow: false,
          activeMarker: null
        })
      }
    };
   
    render() {
      return (
        <div>
            <Map 
            style={{width: '75%', height: '75%', position: 'fixed'}}
                google={this.props.google}
                initialCenter={{
                        lat: this.state.mapCenter.lat,
                        lng: this.state.mapCenter.lng
                    }}
                    center={{
                        lat: this.state.mapCenter.lat,
                        lng: this.state.mapCenter.lng
                    }}
                    zoom={15}
                >
            <Marker 
                position={{
                    lat: this.state.mapCenter.lat,
                    lng: this.state.mapCenter.lng
                }}
                />
    
            <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}>
                <div>
                    <h1>{this.state.selectedPlace.name}</h1>
                </div>
            </InfoWindow>
            </Map>
        </div>
      )
    }
  }
 
export default GoogleApiWrapper({
  apiKey: ('AIzaSyD7Qyjdpl0_P4b0kobkoPdopjMhg1TPUAM')
})(MapContainer); 