import React, { useEffect, useState} from 'react';
import Form from './Form';
import Loader from './Loader';
import GooglePlaces from '../apis/GooglePlaces';
//import Loader from './Loader';

const WatShallIEat = () => {
     //Initializing State Variables
     const [latitude, setLatitude]  = useState(null);
     const [longitude, setLongitude] = useState(null);
     const [error, setError] = useState('');
  
     //const [locationAccess, setLocationAccess] = useState(false);

     //Below makes the browser ask the user for their location as soon as the site is loaded
     useEffect(() => {
        window.navigator.geolocation.getCurrentPosition(
            position => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            err => {
                setError(err.message);
            });
     }, []);
        //console.log(latitude);
        //console.log(longitude);
        if(error){
            return <div>Error: {error}</div>;
        }
        if(latitude && longitude){
            return (
                <div  className="ui container">
                    <Form 
                        latitude={latitude}
                        longitude={longitude} 
                    />
                    <div className="ui divider">
    {/*              <GooglePlaces
                            lat={latitude}
                            lng={longitude}
                        />  */}
                    </div>
                </div>
            );
        }

        return <Loader message="Accept location request." />;
}

export default WatShallIEat;


