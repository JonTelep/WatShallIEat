/*
This component will house the main page of Wat Shall I Eat
There will be other components in here eventually
*/
import React, {  useState} from 'react';
import Dropdown from './Dropdown';
import SlideCheckbox from './SlideCheckbox';

const options = [
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
]

const WatShallIEat = () => {
    const [radius, setRadius] = useState(options[0])
    const [checkboxStatus, setCheckboxStatus] = useState(false);
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
                    options={options}
                /> 
                <h3>Select types of foods:</h3>
                <SlideCheckbox
                    label="Asian"
                    selected={radius}
                    onSelectedChange={setRadius}
                />
                <SlideCheckbox
                    label="Mexican"
                    selected={radius}
                    onSelectedChange={setRadius}
                />
                <SlideCheckbox
                    label="Indian"
                    selected={radius}
                    onSelectedChange={setRadius}
                />
            </div>





                 
        </div>
    );
}

export default WatShallIEat;



/*
        <div class="inline field">
                    <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="0" class="hidden">
                        </input>
                    <label>Asian</label>
                    </div>
                </div>

                */

