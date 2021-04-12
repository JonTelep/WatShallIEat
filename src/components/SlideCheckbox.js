import React, { useState, useEffect, useRef } from 'react';

/* const SlideCheckbox = ({label, onSelectedChange, options, selected}) => {
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
            <input 
            key={option.value} 
            type="checkbox"
            tabIndex="0"
            className="hidden"
                onClick={() => onSelectedChange(option)}
                >
                {option.label}
            </input>
        );
    }); 

    const handle = () =>{
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
                {renderedOptions}
                </div>
            </div>
        </div>
    );

}

export default SlideCheckbox; */

const SlideCheckbox = ({options}) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheck = (e) => {
        setIsChecked(e.target.checked);
    }

    const renderedOptions = options.map((option) => {
/*         if(option.value === selected.value){
            return null;
        } */
        //console.log(option.value);
        return (
            <div
            key={option.value}
            className="inline field">
                <div className={`ui toggle checkbox ${isChecked ? 'checked': ''}`}>
                    <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
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