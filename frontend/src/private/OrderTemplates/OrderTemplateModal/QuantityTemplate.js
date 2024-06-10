import React, { useRef, useEffect } from "react";

/***
 * props:
 * - id
 * - text
 * - quantity
 * - multiplier
 * - onChange
 */
function QuantityTemplate(props) {

    const quantityRef = useRef('');

    function onQuantityChange(event) {
        let value = event.target.value;
        if (value === 'Max. Wallet')
            value = 'MAX_WALLET';
        else if (value === 'Min. Notional')
            value = 'MIN_NOTIONAL';
        props.onChange({ target: { id: props.id, value } });
    }

    useEffect(() => {
        if (props.quantity === null || props.quantity === undefined) return;

        if (props.quantity === 'MAX_WALLET')
            quantityRef.current.value = 'Max. Wallet';
        else if (props.quantity === 'MIN_NOTIONAL')
            quantityRef.current.value = 'Min. Notional';
        else quantityRef.current.value = props.quantity;


    }, [props.quantity])

    return (
        <React.Fragment>
            <div className="form-group">
                <label htmlFor={props.id}>{props.text} <span data-bs-toggle="tooltip" data-bs-placement="top" title="Max. Wallet trades the maximum you have. Min. Notional trades the minimum allowed. Multiplying by 1 = 100%." className="badge bg-warning py-1">?</span></label>
                <div className="input-group">
                    <input type="text" ref={quantityRef} id={props.id} list="qtyOptons" className="form-control w-50" onChange={onQuantityChange} placeholder="0"></input>
                    <span className="input-group-text bg-secondary">X</span>
                    <input type="text" id={props.id + 'Multiplier'} className="form-control" onChange={props.onChange} placeholder="1" defaultValue={props.multiplier} />
                    <datalist id="qtyOptons">
                        <option>Max. Wallet</option>
                        <option>Min. Notional</option>
                    </datalist>
                </div>
            </div>
        </React.Fragment>
    )
}

export default QuantityTemplate;