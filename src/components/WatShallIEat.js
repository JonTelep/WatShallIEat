/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually

radius must be in meters
the cap is 50000 meters equivalent to 31 miles
*/
import React, { useState } from 'react';
import FoodForm from './Form';






const WatShallIEat = ( props ) => { 
    const [displaySelection, setDisplaySelection] = useState(false);
    const [displayRandomFood, setDisplayRandomFood] = useState(null);
    const candidatesArray = [
        {
            name: 'Initial',
            address: '123 init drive'
        }
    ];


    const formatResponseBody = (value) => {
        //onChange={(value) => setFormBody(value)}
        var resultObject = JSON.parse(value);


        for(var i = 0; i<resultObject.candidates.length; i ++){
            candidatesArray[i] =  { name: resultObject.candidates[i].name, address: resultObject.candidates[i].formatted_address };
            console.log(candidatesArray);
        }
        var randomFoodIndex = getRandomNumber(resultObject.candidates.length);
        console.log(`random index is: ${randomFoodIndex}`);
         setDisplayRandomFood(
            `<div key=${resultObject.candidates[randomFoodIndex].address}>
                <h3>Name:</h3>
                <div>
                    ${resultObject.candidates[randomFoodIndex].name}
                </div>
                <h3>Address:</h3>
                <div>
                    ${resultObject.candidates[randomFoodIndex].address}
                </div>
            
            </div>`) 
        setDisplaySelection(true);

    }

    const getRandomNumber = (max) => {
        return Math.floor(Math.random() * max);
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
                    { displayRandomFood }
                    
                </div>      
            </div>
        );

    }
}

export default WatShallIEat;