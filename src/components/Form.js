/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually
*/
import React, {  useState} from 'react';
import Dropdown from './Dropdown';
import SlideCheckbox from './SlideCheckbox';

const radiusOptions = [
    {
        label: '1 miles',
        value: '1'
    },
    {
        label: '2 miles',
        value: '2'
    },
    {
        label: '3 miles',
        value: '3'
    },
    {
        label: '4 miles',
        value: '4'
    },
    {
        label: '5 miles',
        value: '5'
    }
];

const foodOptions = [
    {
        label: 'Asian',
        value: 'Asian',

    },
    {
        label: 'Fastfood',
        value: 'Fastfood',
    },
    {
        label: 'Mexican',
        value: 'Mexican',
    },
    {
        label: 'Indian',
        value: 'Indian',
    },
    {
        label: 'Thai',
        value: 'Thai',
    },
]

const WatShallIEat = () => {
    const [radius, setRadius] = useState(radiusOptions[0]);
    return(
        <div class="ui form">
            <h3 className="ui top attached header">
                Please select some options
            </h3>
            <div className="ui attached segment">
                <Dropdown
                    label="Select a radius"
                    selected={radius}
                    onSelectedChange={setRadius}
                    options={radiusOptions}
                /> 
                <h3>Select types of foods:</h3>
                <SlideCheckbox  
                    options={foodOptions}
                />
            </div>    
            <button class="massive ui button">
            Run it
            </button> 
        </div>
    );
}

export default WatShallIEat;



/*
                <input 
                    type="checkbox" 
                    tabindex="0" 
                    class="hidden"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}>
                    </input>


        <div class="inline field">
                    <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="0" class="hidden">
                        </input>
                    <label>Asian</label>
                    </div>
                </div>

                */

