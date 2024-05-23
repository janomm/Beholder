import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom.min";
import Menu from "../../components/Menu/Menu";
import Pagination from "../../components/Pagination/Pagination";
import { getAutomations, stopAutomation, startAutomation, deleteAutomation } from "../../services/AutomationService";
import AutomationRow from "./AutomationRow";
import AutomationModal from "./AutomationModal/AutomationModal";

function Automations() {

    const DEFAULT_AUTOMATION = {
        name: '',
        conditions: '',
        indexes: ''
    }

    const defaultLocation = useLocation();

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page');
    }

    const history = useHistory();

    const [automations, setAutomations] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(getPage());
    const [editAutomation, setEditAutomation] = useState(DEFAULT_AUTOMATION);

    useEffect(() => {
        return history.listen(location => setPage(getPage(location)));
    }, [history])

    useEffect(() => {
        const token = localStorage.getItem('token');
        getAutomations(page || 1, token)
            .then(result => {
                setCount(result.count);
                setAutomations(result.rows);
                console.log(result.rows)
            })
            .catch(err => console.error(err.response ? err.response.data : err.message))
    }, [page])

    function onNewAutomationClick() {
        setEditAutomation(DEFAULT_AUTOMATION);

        //setAutomations(DEFAULT_AUTOMATION);
    }

    function onEditAutomationClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('edit', '');
        setEditAutomation(automations.find(a => a.id == id));
    }

    function onStopAutomationClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('stop', '');
        stopAutomation(id, token)
            .then(() => history.go(0))
            .catch(err => console.error(err.response ? err.response.data : err.message));

    }

    function onStartAutomationClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('start', '');
        startAutomation(id, token)
            .then(() => history.go(0))
            .catch(err => console.error(err.response ? err.response.data : err.message));
    }

    function onDeleteAutomationClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('delete', '');
        deleteAutomation(id, token)
            .then(() => history.go(0))
            .catch(err => console.error(err.response ? err.response.data : err.message));
    }

    function onAutomationSubmit(event) {
        history.go(0);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h4 className="h4">Automations</h4>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <button id="btnNewAutomation" className="btn btn-primary animate-up-2" data-bs-toggle="modal" data-bs-target="#modalAutomation" onClick={onNewAutomationClick}>
                                <svg className="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                New Automation
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Active</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                automations.map(automation => (
                                    <AutomationRow key={automation.id} data={automation} onEditClick={onEditAutomationClick} onStartClick={onStartAutomationClick} onStopClick={onStopAutomationClick} onDeleteClick={onDeleteAutomationClick} />
                                ))
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
            </main>
            <AutomationModal data={editAutomation} onSubmit={onAutomationSubmit} />
        </React.Fragment>
    );
}

export default Automations;