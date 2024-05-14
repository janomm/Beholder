import React, { useRef, useEffect } from "react";

/***
 * props:
 * - id
 * - text
 * - isChecked
 * - onChange
 */
function SwitchInput(props) {

    const switchRef = useRef('');

    function onChange(event) {
        props.onChange({ target: { id: props.id, value: switchRef.current.checked } })
    }

    useEffect(() => {
        switchRef.current.checked = props.isChecked;
    }, [props.isChecked])

    return (
        <div>
            <div className="form-check form-switch">
                <input ref={switchRef} className="form-check-input" type="checkbox" id={props.id} onChange={onChange} />
                <label htmlFor={props.id} className="form-check-label">{props.text}</label>
            </div>
        </div>
    )
}

export default SwitchInput;