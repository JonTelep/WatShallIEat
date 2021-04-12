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
        id: 1,
        value: 'Asian',
        isChecked: false
    },
    {
        id: 2,
        value: 'Fastfood',
        isChecked: false
    },
    {
        id: 3,
        value: 'Mexican',
        isChecked: false
    },
    {
        id: 4,
        value: 'Indian',
        isChecked: false
    },
    {
        id: 5,
        value: 'Thai',
        isChecked: false
    }
];

const WatShallIEat = () => {
    const [radius, setRadius] = useState(radiusOptions[0]);
    const [foodOptions, setFoodOptions] = useState(foodOptions);


    const handleAllChecked = (event) => {
        let foodOptions = foodOptions;
        foodOptions.forEach(food => food.isChecked = event.target.checked) ;
        setFoodOptions(foodOptions);
      }
    
      const handleCheckChieldElement = (event) => {
        let foodOptions = foodOptions;
        foodOptions.forEach(food => {
           if (food.value === event.target.value)
              food.isChecked =  event.target.checked
        })
        //this.setState({fruites: fruites})
        setFoodOptions(foodOptions);
      }


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
                <input onClick={handleAllChecked} type="checkbox" value="checkedall" /> Check / Uncheck All
                <ul>
                    {
                        foodOptions.map((food) => {
                            return (<SlideCheckbox handleCheckChieldElement={handleCheckChieldElement} {...food} />)
                        })
                    }
                </ul>






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

