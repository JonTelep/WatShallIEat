import React, { useState, useEffect, useRef } from 'react';

const SlideCheckbox = ({label, onSelectedChange, options, selected}) => {
    const [open, setOpen] = useState(false); //defaulting checkbox as not selected
    const ref = useRef();

    useEffect(() => {
        const onBodyClick = (event) => {
            if(ref.current && ref.current.contains(event.target)) {
                console.log("inside if statement");
                return;
                
            }
            setOpen(!open);
            console.log("I was clicked");
        }
            document.body.addEventListener('click', onBodyClick);

        return () => {
            document.body.removeEventListener('click', onBodyClick);
        }; 
    }, []);

     const renderedOptions = options.map((option) => {
        if(option.value === selected.value){
            return null;
        }
        return (
            <div 
            key={option.value} 
            className="item"
                onClick={() => onSelectedChange(option)}
                >
                {option.label}
            </div>
        );
    }); 

    const iwasclicked = () =>{
        console.log("I was clicked");
        //
    }
    
    return(
        <div ref={ref} className="ui form">
            <div className="inline field">
                <div 
                    onClick={() => setOpen(!open)}
                    className={`ui toggle checkbox ${open ? 'checked': ''}`}
                >
                <input 
                    type="checkbox" 
                    tabIndex="0" 
                    className="hidden"
                >
                </input>
                <label>{label}</label>
                </div>
            </div>
        </div>
    );

}

export default SlideCheckbox;