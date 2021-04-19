/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually
*/
import React from 'react';
import FoodForm from './Form';

const WatShallIEat = ( props ) => {    
    return(
        <div className="ui form">
            <h3 className="ui top attached header">
                Please select some options
            </h3>
            <div className="ui attached segment">                
                <FoodForm 
                    latitude={props.lat}
                    longitude={props.lng}
                />
            </div>      
        </div>
    );
}

export default WatShallIEat;