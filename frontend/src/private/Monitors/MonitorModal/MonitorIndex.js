import React, { useRef, useState, useEffect } from "react";
import SmartBadge from "../../../components/SmartBadge/SmartBadge";
import { getAnalysisIndexes } from "../../../services/BeholderServices";

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
    const [analysis, setAnalysis] = useState([]);

    useEffect(() => {
        if (props.indexes) {
            setIndexes(props.indexes.split(','));
        } else {
            setIndexes([]);
        }
    }, [props.indexes])

    useEffect(() => {
        const token = localStorage.getItem('token');
        getAnalysisIndexes(token)
            .then(result => setAnalysis(result))
            .catch(err => console.error(err.response ? err.response.data : err.message));
    }, [])

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
        const value = event.target.value;
        if (value === 'NONE') return;
        const { params } = analysis[event.target.value];
        inputPeriod.current.placeholder = params;
        if (params === 'none')
            inputPeriod.current.className = 'd-none';
        else
            inputPeriod.current.className = 'form-control';

        /*switch (event.target.value) {
            case 'BB': inputPeriod.current.value = '20_2'; break;
            case 'EMA': inputPeriod.current.value = '10'; break;
            case 'MACD': inputPeriod.current.value = '12_26_9'; break;
            case 'RSI': inputPeriod.current.value = '14'; break;
            case 'SMA': inputPeriod.current.value = '10'; break;
            case 'SRSI': inputPeriod.current.value = '3_3_14_14'; break;
            default: break;
        }*/
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
                                {
                                    analysis && Object.entries(analysis)
                                        .sort((a, b) => {
                                            if (a[0] > b[0]) return 1;
                                            if (a[0] < b[0]) return -1;
                                            return 0;
                                        })
                                        .map(props => (<option key={props[0]} value={props[0]}>{props[1].name} - ({props[1].params})</option>))
                                }
                            </select>
                            <input ref={inputPeriod} type="text" id="params" placeholder="params" className="d-none" />
                            <button type="button" className="btn btn-secondary" ref={btnAddIndex} onClick={onAddIndexClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2" ><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="divScrollBadges">
                <div className="d-inline-flex align-content-start">
                    {
                        indexes.map(ix => (
                            <SmartBadge key={ix} id={"ix" + ix} text={ix} onClick={onRemoveIndex} />
                        ))
                    }
                </div>
            </div>
        </React.Fragment>
    );

}

export default MonitorIndex;