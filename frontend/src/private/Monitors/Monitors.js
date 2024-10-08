import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Menu from "../../components/Menu/Menu";
import Pagination from "../../components/Pagination/Pagination";
//import Footer from "../../Footer/Footer";
import { getMonitors, deleteMonitor, startMonitor, stopMonitor } from '../../services/MonitorServices';
import MonitorRow from "./MonitorRow";
import MonitorModal from "./MonitorModal/MonitorModal";
import Toast from "../../components/Toast/Toast";

function Monitors() {

    const defaultLocation = useLocation();
    const history = useHistory();
    const [page, setPage] = useState(getPage());
    const [count, setCount] = useState(0);
    const [monitors, setMonitors] = useState([]);
    const DEFAULT_MONITOR = {
        symbol: 'BNBBTC',
        type: 'CANDLES',
        interval: '1m',
        isActive: false,
        logs: false
    }
    const [editMonitor, setEditMonitor] = useState(DEFAULT_MONITOR);
    const [notification, setNotification] = useState({ type: '', text: '' });

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page');
    }

    useEffect(() => {
        return history.listen(location => {
            setPage(getPage(location));
        })
    }, [history])

    useEffect(() => {
        const token = localStorage.getItem('token');
        getMonitors(page || 1, token)
            .then(result => {
                setMonitors(result.rows);
                setCount(result.count);
            })
            .catch(err => console.log(err.response ? err.response.data : err.message));
    }, [page])

    function onEditClick(event) {
        const id = event.target.id.replace('edit', '');
        setEditMonitor(monitors.find(m => m.id == id));
    }

    function onStopClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('stop', '');
        stopMonitor(id, token)
            .then(() => history.go(0))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onStartClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('start', '');
        startMonitor(id, token)
            .then(() => history.go(0))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onDeleteClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('delete', '');
        deleteMonitor(id, token)
            .then(() => history.go(0))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onModalSubmit(event) {
        history.go(0);
    }

    function onNewMonitorClick() {
        setEditMonitor(DEFAULT_MONITOR);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h4 className="h4">Monitors</h4>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <button id="btnNewMonitor" className="btn btn-primary animate-up-2" data-bs-toggle="modal" data-bs-target="#modalMonitor" onClick={onNewMonitorClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2"><path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.501 3.501 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.501 3.501 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm1.5 0a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75v-7.5Z" clipRule="evenodd" /></svg>
                                New Monitor
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Type</th>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Active</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                monitors && monitors.length
                                    ? monitors.map(monitor => (<MonitorRow key={monitor.id} data={monitor} onEditClick={onEditClick} onStartClick={onStartClick} onStopClick={onStopClick} onDeleteClick={onDeleteClick} />))
                                    : <React.Fragment />
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
            </main>
            <MonitorModal data={editMonitor} onSubmit={onModalSubmit} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default Monitors;