import React, { useRef } from 'react';

const SlideCheckbox = ({options, currentUserId}) => {
    const checkRef = useRef();
    const handleCheck = (event) => {
        const target = event.target;
        const name = target.name;
        options.map(option => {            
            console.log(option.id);
            console.log(target.id);
            if(option.id == target.id){
                if(checkRef.current.checked === true){
                    option.checked = false;
                    option.isChecked = false;
                    console.log("true");
                }
                if(checkRef.current.checked === false){
                    option.checked = true;
                    option.isChecked = true;
                    console.log("false");
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
                    name={option.value}
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