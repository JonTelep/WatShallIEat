//import React, { useState, useEffect, useRef } from 'react';
import React from 'react'

export const CheckBox = props => {
    return (
      <li>
       <input key={props.id} onClick={props.handleCheckChieldElement} type="checkbox" checked={props.isChecked} value={props.value} /> {props.value}
      </li>
    )
}

export default CheckBox





/* const SlideCheckbox = ({options}) => {
    const [isChecked, setIsChecked] = useState(false);
    const handleCheck = (e) => {

        setIsChecked(e.target.checked);
        option.isChecked = e.target.checked;
        console.log(e.target.value)
        console.log(isChecked);

    }

    const handleAllChecked = (event) => {

    }

    const renderedOptions = options.map((option) => {

        //console.log(option.value);
        return (
            <div           
            className="inline field">
                <h1>Check and Uncheck All Example</h1>
                <input type="checkbox" onClick={handleAllChecked}  value="checkedall" /> Check / Uncheck All
                <div className={`ui toggle checkbox ${isChecked ? 'checked': ''}`}>
                    {
                        options.map((option)) => {
                            return ( <>)
                        }
                    }
                    <input
                    key={option.value}
                    type="checkbox"
                    value={option.value}
                    checked={option.isChecked}
                    onChange={handleCheck(option)} 
                    />
                        <label>{option.label}</label>
                </div>
            </div>
        );
    }); 

    return(
        <div className="inline field">
            <div >
                {renderedOptions}
            </div>
        </div>
    )
}

export default SlideCheckbox; */