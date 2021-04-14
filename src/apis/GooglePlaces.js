import React from 'react';
import MapContainer from '../components/GoogleMap';

const GooglePlaces = ( {lat, lng}) => {
    console.log('right here');
    console.log(`latitude is ${lat}`);
    console.log(`longitude is ${lng}`); 
    


    return(
        <div>
             Below is the map:
            <MapContainer
                
            />
        </div>
    );
}

export default GooglePlaces;

