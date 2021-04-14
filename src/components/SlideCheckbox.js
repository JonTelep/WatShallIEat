import React, { useState, useEffect, useRef } from 'react';

const SlideCheckbox = ({options, currentUserId}) => {
    const checkRef = useRef();
    const handleCheck = (event) => {
        options.map(option => {            
            if(option.id == event.target.id){
                if(checkRef.current.checked === true){
                    option.checked = false;
                }
                if(checkRef.current.checked === false){
                    option.checked = true;
                }                
            }
        });
    }

    const renderedOptions = options.map((option) => {
        return (
            <div
            key={option.id}
            className="inline field">
                <div
                id={`checkbox${option.id}`}
                className= {`ui toggle checkbox ${option.checked ? 'checked': ''}`}
                >
                    <input
                    ref={checkRef}
                    id={option.id}
                    type="checkbox"
                    value={option.value}
                    checked={option.checked}
                    onChange={handleCheck} 
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

export default SlideCheckbox;