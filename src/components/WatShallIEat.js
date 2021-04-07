import React, { useEffect, useState} from 'react';
import Form from './Form';
import GooglePlaces from '../apis/GooglePlaces';
//import Loader from './Loader';

const WatShallIEat = () => {
     //Initializing State Variables
     const [latitude, setLatitude]  = useState();
     const [longitude, setLongitude] = useState();
     const [error, setError] = useState('');
     const [debug, setDebug] = useState(0);
     //const [locationAccess, setLocationAccess] = useState(false);
     
 
     //Below makes the browser ask the user for their location as soon as the site is loaded
     useEffect(() => {
         const findLocation = () => {
            window.navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                err => {
                    setError(err.message);
                });
            }
            findLocation();
            setDebug(debug+1);
            console.log(debug);
     }, []);
        
        /*     if(latitude !== null && longitude !== null){
            setLocationAccess(true);
        } */
    return (
        <div  className="ui container">
            <Form />
            <div class="ui divider">
                <GooglePlaces
                    lat={latitude}
                    lng={longitude}
                />
            </div>
        </div>
    );
}

export default WatShallIEat;


