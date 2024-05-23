import React, { useRef, useState, useEffect } from "react";
import SelectSymbol from "../../../components/SelectSymbol/SelectSymbol";
import MonitorType from "./MonitorType";
import SelectInterval from "./SelectInterval";
import MonitorIndex from "./MonitorIndex";
import SwitchInput from "../../../components/SwitchInput/SwitchInput";
import { saveMonitor } from "../../../services/MonitorServices";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

/***
 * props:
 * - data
 * - onSubmit
 */

function MonitorModal(props) {

    const [error, setError] = useState('');
    const [monitor, setMonitor] = useState({ type: 'CANDLES', interval: '1m' });

    const btnClose = useRef('');
    const btnSave = useRef('');

    //const history = useHistory("");

    useEffect(() => {
        setMonitor(props.data);
    }, [props.data])

    function onSubmit(event) {
        const token = localStorage.getItem('token');
        const broadcastLabel = document.getElementById('broadcastLabel').value.length === 0 ? ' ' : document.getElementById('broadcastLabel').value;
        monitor.broadcastLabel = broadcastLabel;

        saveMonitor(monitor.id, monitor, token)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result)

            })
            .catch(err => {
                console.err(err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data : err.message);
            });
    }

    function onInputChange(event) {
        setMonitor(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    function getIntervalClasses(monitorType) {
        return monitorType === 'CANDLES' ? 'col-md-6 mb-3' : 'col-md-6 mb-3 d-none';
    }

    return (
        <div className="modal fade" id="modalMonitor" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{props.data.id ? 'Edit ' : 'New '}Monitor</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className='form-group'>
                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <MonitorType type={monitor.type} onChange={onInputChange} />
                                </div>
                                {
                                    monitor.type === 'CANDLES' || monitor.type === 'TICKER'
                                        ? (
                                            <div className='col-md-6 mb-3'>
                                                <div className='form-group'>
                                                    <label htmlFor='symbol'>Symbol</label>
                                                    <SelectSymbol onChange={onInputChange} symbol={monitor.symbol} onlyFavorites={false} />
                                                </div>
                                            </div>
                                        )
                                        : <React.Fragment />
                                }
                            </div>
                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <div className="form-group">
                                        <label htmlFor="broadcastLabel">
                                            Broadcast Label:
                                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Label to broadcast then info via WebSockets" className="badge bg-warning py-1">?</span>
                                        </label>
                                        <input type="text" id="broadcastLabel" className="form-control" onChange={onInputChange} defaultValue={monitor.broadcastLabel} placeholder="none" />
                                    </div>
                                </div>
                                <div className={getIntervalClasses(monitor.type)}>
                                    <SelectInterval interval={monitor.interval} onChange={onInputChange} />
                                </div>
                            </div>
                            {
                                monitor.type === 'CANDLES'
                                    ? (<MonitorIndex indexes={monitor.indexes} onChange={onInputChange} />)
                                    : <React.Fragment />
                            }

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <SwitchInput id="isActive" text="Is Active?" onChange={onInputChange} isChecked={monitor.isActive} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <SwitchInput id="logs" text="Has Logs?" onChange={onInputChange} isChecked={monitor.logs} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {
                            error
                                ? <div className="alert alert-danger mt-1 col-9 py-1">{error}</div>
                                : <React.Fragment />
                        }
                        <button ref={btnSave} type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonitorModal;