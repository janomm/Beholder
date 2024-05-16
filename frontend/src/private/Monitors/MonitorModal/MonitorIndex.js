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
    const inputPeriod = useRef('');

    const [indexes, setIndexes] = useState([]);

    useEffect(() => {
        if (props.indexes) {
            setIndexes(props.indexes.split(','));
        } else {
            setIndexes([]);
        }
    }, [props.indexes])

    function onAddIndexClick(event) {
        const value = selectIndex.current.value;
        if (value !== 'NONE' && indexes.indexOf(value) === -1) {
            inputPeriod.current.value = inputPeriod.current.value == 'params' ? '' : inputPeriod.current.value
            const valueFinal = value + (inputPeriod.current.value ? "_" + inputPeriod.current.value.split(",").join("_") : "");
            selectIndex.current.value = 'NONE';
            inputPeriod.current.value = '';
            indexes.push(valueFinal);
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

    function onIndexChange(event) {
        switch (event.target.value) {
            case 'BB': inputPeriod.current.value = '20_2'; break;
            case 'EMA': inputPeriod.current.value = '10'; break;
            case 'MACD': inputPeriod.current.value = '12_26_9'; break;
            case 'RSI': inputPeriod.current.value = '14'; break;
            case 'SMA': inputPeriod.current.value = '10'; break;
            case 'SRSI': inputPeriod.current.value = '3_3_14_14'; break;
            default: break;
        }
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12 mb-3">
                    <div className="form-group">
                        <label htmlFor="indexes">
                            Indexes:
                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Then index params in parenthesis must be provided." className="badge bg-warning py-1">?</span>
                        </label>
                        <div className="input-group input-group-merge">
                            <select id="indexes" ref={selectIndex} className="form-select" defaultValue="NONE" onChange={onIndexChange}>
                                <option value="NONE">None</option>
                                <option value="BB">Bollinger Band - (period and std. dev.)</option>
                                <option value="EMA">EMA - (period)</option>
                                <option value="MACD">MACD - (fast, slow and signal periods)</option>
                                <option value="RSI">RSI - (period)</option>
                                <option value="SMA">SMA - (period)</option>
                                <option value="SRSI">StochRSI - (d, k, rsi and stochastic periods)</option>
                            </select>
                            <input ref={inputPeriod} type="text" id="params" placeholder="params" className="form-control" required={false} />
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