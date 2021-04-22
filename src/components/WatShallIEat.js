/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually

radius must be in meters
the cap is 50000 meters equivalent to 31 miles
*/
import React, { useState } from 'react';
import FoodForm from './Form';
import RandomPlace from './RandomPlace';

const WatShallIEat = ( props ) => { 
    const [displaySelection, setDisplaySelection] = useState(false);
    const [candidatesArray, setCandidatesArray] = useState([
        {
            name: 'Initial',
            address: '123 init drive',
            openNow: false,
            photoId : ''
        }
    ]);

    
    const getRandomNumber = (max) => {
        return Math.floor(Math.random() * max);
    }


    const formatResponseBody = (value) => {
        setDisplaySelection(false);
        //onChange={(value) => setFormBody(value)}
       
        console.log(typeof value);
        console.log(value.length);
        console.log(value[1].name);
        var resultObject = value;



        for(var i = 0; i<resultObject.length; i ++){
            candidatesArray[i] =  { 
                name: resultObject[i].name, 
                address: resultObject[i].vicinity,
                openNow: resultObject[i].opening_hours.open_now,
                photoId: resultObject[i].photos[0].photo_reference,
            };
            console.log(candidatesArray);
        }
        var randomFoodIndex = getRandomNumber(candidatesArray.length);
        console.log(`random index is: ${randomFoodIndex}`);
       
        setDisplaySelection(true);
        

    }


    if(!displaySelection){
        return(
            <div className="ui form">
                <h3 className="ui top attached header">
                    Please select some options
                </h3>
                <div className="ui attached segment">                
                    <FoodForm 
                        latitude={props.lat}
                        longitude={props.lng}
                        onChange={(value) => formatResponseBody(value)}

                    />
                    
                </div>      
            </div>
        ); 
    }else{
        return(
            <div className="ui form">
                <h3 className="ui top attached header">
                    Please select some options
                </h3>
                <div className="ui attached segment">                
                    <FoodForm 
                        latitude={props.lat}
                        longitude={props.lng}
                        onChange={(value) => formatResponseBody(value)}

                    />
                    
                </div>      
                <h3 className="ui top attached header">
                    You should eat here:
                </h3>
                <div className="ui attached segment">  
                Should be below here:              
                    <RandomPlace place={candidatesArray[getRandomNumber(candidatesArray.length)]} />
                    
                </div>      
            </div>
        );

    }
}

export default WatShallIEat;