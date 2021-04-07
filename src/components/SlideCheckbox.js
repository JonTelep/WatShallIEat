import React, { useState, useEffect, useRef } from 'react';

const SlideCheckbox = ({label, onSelectedChange, selected}) => {
    const [open, setOpen] = useState(false); //defaulting dropdown closed, creating state to open and close dropdown
    const ref = useRef();

    useEffect(() => {
        const onBodyClick = (event) => {
            if(ref.current && ref.current.contains(event.target)) {
                return;
            }
            setOpen(false);
        }
        document.body.addEventListener('click', onBodyClick);

        return () => {
            document.body.removeEventListener('click', onBodyClick);
        };
    }, []);

/*     const renderedOptions = options.map((option) => {
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
    }); */
    
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