import React, { useRef, useState, useEffect } from "react";
import SmartBadge from "../../../components/SmartBadge/SmartBadge";

/***
 * props:
 * - indexes
 * - onChange
 */
function MonitorIndex(props) {

    const btnAddIndex = useRef('');
    const selectIndex = useRef('');

    const [indexes, setIndexes] = useState([]);

    useEffect(() => {
        if (!props.indexes) return;
        setIndexes(props.indexes.split(','));
    }, [props.indexes])

    function onAddIndexClick(event) {
        const value = selectIndex.current.value;
        console.log(value);
        if (value !== 'NONE' && indexes.indexOf(value) === -1) {
            indexes.push(value);
            setIndexes(indexes);
            if (props.onChange) props.onChange({ target: { id: 'indexes', value: indexes.join(',') } })
        }
    }

    function onRemoveIndex(event) {
        const id = event.target.id.replace('ix', '');
        const pos = indexes.findIndex(ix => ix === id);
        indexes.splice(pos, 1);
        setIndexes(indexes);
        if (props.onChange) props.onChange({ target: { id: 'indexes', value: indexes.join(',') } })
    }
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12 mb-3">
                    <div className="form-group">
                        <label htmlFor="indexes">Indexes:</label>
                        <div className="input-group input-group-merge">
                            <select id="indexes" ref={selectIndex} className="form-select" defaultValue="NONE">
                                <option value="NONE">None</option>
                                <option value="MACD">MACD - Moving Averege Convergence Divergence</option>
                                <option value="RSI">RSI - Relative Strenght Index</option>
                            </select>
                            <button type="button" className="btn btn-secondary" ref={btnAddIndex} onClick={onAddIndexClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2" ><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-inline-flex align-content-start">
                {
                    indexes.map(ix => (
                        <SmartBadge key={ix} id={"ix" + ix} text={ix} onClick={onRemoveIndex} />
                    ))
                }
            </div>
        </React.Fragment>
    );

}

export default MonitorIndex;