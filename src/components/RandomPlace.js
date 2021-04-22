import React, { useState } from 'react';
import axios from 'axios';


const RandomPlace = ({ place }) => {
    const [photo, setPhoto] = useState([]);
    const loadPlacePhoto = () => {
        //base url:
        //https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${props.photoId}&key=${process.env.REACT_APP_API_GOOGLE_PLACES}
        axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoId}&key=${process.env.REACT_APP_API_GOOGLE_PLACES}`)
        .then(response =>{
          setPhoto(response.data.results);
          console.log("this is the image call");
          console.log(response);
        
        })
        .catch(err => {
            console.log(err);
        });
    }

    return (
        <div key={place.address}>
            <img className="ui medium circular image" src={photo}></img>
            <h3>Name:</h3>
            <div>
                {place.name}
            </div>
            <h3>Address:</h3>
            <div>
                {place.address}
            </div>
            <h3>IsOpen:</h3>
            <div>
                {place.openNow}
            </div>
        </div>
    );

}

export default RandomPlace;