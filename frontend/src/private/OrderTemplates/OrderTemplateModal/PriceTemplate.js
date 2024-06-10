import React, { useState, useEffect } from "react";

/***
 * props:
 * - id
 * - text
 * - indexes
 * - price
 * - multiplier
 * - onChange
 */
function PriceTemplate(props) {

    const [indexes, setIndexes] = useState([]);

    useEffect(() => {
        setIndexes(props.indexes);
    }, [props.indexes])


    return (
        <React.Fragment>
            <div className="form-group">
                <label htmlFor={props.id}>{props.text} <span data-bs-toggle="tooltip" data-bs-placement="top" title="Specify a price or choose an index. Multiplying by 1 = 100%." className="badge bg-warning py-1">?</span></label>
                <div className="input-group">
                    <input type="text" id={props.id} list="variables" className="form-control w-50" onChange={props.onChange} placeholder="0" defaultValue={props.price}></input>
                    <span className="input-group-text bg-secondary">X</span>
                    <input type="text" id={props.id + 'Multiplier'} className="form-control" onChange={props.onChange} placeholder="1" defaultValue={props.multiplier} />
                    <datalist id="variables">
                        {
                            props.indexes && Array.isArray(indexes)
                                ? (
                                    indexes.map(item => (
                                        <option key={`${item.symbol}:${item.variable}`}>{item.variable}</option>
                                    ))
                                )
                                : <option>NO INDEXES</option>
                        }
                    </datalist>
                </div>
            </div>
        </React.Fragment>
    )
}

export default PriceTemplate;