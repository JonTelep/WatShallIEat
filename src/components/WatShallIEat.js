/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually
*/
import React, { useEffect, useState} from 'react';


const WatShallIEat = () => {
    //Initializing State Variables
    const [latitude, setLatitude]  = useState(null);
    const [longitude, setLongitude] = useState(null);
    //const [locationAccess, setLocationAccess] = useState(false);
    

    //Below makes the browser ask the user for their location as soon as the site is loaded
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
         /*    latitude = position.coords.latitude;
            longitude = position.coords.longitude; */
          });

    }, []);

/*     if(latitude !== null && longitude !== null){
        setLocationAccess(true);
    } */



    return(
        <div>
             <div>{latitude} and {longitude} </div>
        </div>

    );
}

export default WatShallIEat;