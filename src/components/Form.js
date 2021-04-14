/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually
*/
import React, {  useState} from 'react';
import { useEffect } from 'react/cjs/react.development';
import Dropdown from './Dropdown';
import SlideCheckbox from './SlideCheckbox';

const radiusOptions = [
    {
        label: '5 miles',
        value: '5'
    },
    {
        label: '10 miles',
        value: '10'
    },
    {
        label: '15 miles',
        value: '15'
    },
    {
        label: '20 miles',
        value: '20'
    },
    {
        label: '25 miles',
        value: '25'
    }
];

const foodOptions = [
    {
        id: 0,
        label: 'American',
        value: 'American',
        isChecked: false
    },
    {
        id: 1,
        label: 'Asian',
        value: 'Asian',
        isChecked: false
    },
    {
        id: 2,
        label: 'Fastfood',
        value: 'Fastfood',
        isChecked: false
    },
    {
        id: 3,
        label: 'Mexican',
        value: 'Mexican',
        isChecked: false
    },
    {
        id: 4,
        label: 'Indian',
        value: 'Indian',
        isChecked: false
    },
    {
        id: 5,
        label: 'Thai',
        value: 'Thai',
        isChecked: false
    },
    {
        id: 6,
        label: 'Sushi',
        value: 'Sushi',
        isChecked: false
    }
];



const WatShallIEat = ({latitude, longitude}) => {
    const [radius, setRadius] = useState(radiusOptions[0]);
    const [foodResults, setFoodResults] = useState(foodOptions);
    

    const onChangeCheckbox = (foodOptions) =>{
        setFoodResults(foodOptions);
    }
    const onChangeRadius = (radius) =>{
        setRadius(radius);
    }

    const handleSubmit = () =>{
        console.log(radius);
        console.log(longitude);
        console.log(latitude);
        console.log(foodOptions);

    }
    
/*     const PostalCodeContent = () => {
        return(
            <div class="field">
                <label>First Name</label>
                <input type="text" name="first-name" placeholder="Enter Postal Code" />
            </div>
        );
    } */
    
    return(
        <div className="ui form">
        <h3 className="ui top attached header">
            Please select some options
        </h3>
        <div className="ui attached segment">
            <Dropdown
                label="Select a radius"
                selected={radius}
                onSelectedChange={setRadius}
                options={radiusOptions}
                onChange={onChangeRadius}
            /> 
            {/* {latitude ? PostalCodeContent : ''} */}

            <h3>Select types of foods:</h3>
            <SlideCheckbox  
                options={foodOptions}
                onChange={onChangeCheckbox}
            />
        </div>    
        <button 
        className="massive ui button"
        onClick={handleSubmit}
        >
        Run it
        </button> 
        
        
    </div>
    );
}

export default WatShallIEat;