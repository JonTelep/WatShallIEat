import React from 'react';
//import axios from 'axios';


const RandomPlace = ({ place }) => {
    //const [photo, setPhoto] = useState([]);

    //turns out the images received are images from customers, some not so pleasant photos, therefore I need to re evaluate this approach

    //commenting out for future use when images are going to be displayed.
    //This may not be best approach though. it works but the image is from reviews, majority of reviews are bad.
/*     const loadPlacePhoto = () => {
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
    } */
    return (
        <div key={place.address}>
            {/* <img className="ui medium circular image" src={photo}></img> */}
            <h3>Name:</h3>
            <div>
                {place.name}
            </div>
            <h3>Address:</h3>
            <div>
                {place.address}
            </div>
            <h3>IsOpen:</h3>
            { 
            place.openNow ?    
            <div> 
                The place is open!
            </div> : 
            <div> The place is not open at this time.</div>
            }

        </div>
    );

}

export default RandomPlace;