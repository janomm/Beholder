import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom.min";
import Menu from "../../components/Menu/Menu";
import Pagination from "../../components/Pagination/Pagination";
import OrderTemplateRow from "./OrderTemplateRow";
import OrderTemplateModal, { DEFAULT_ORDER_TEMPLATE } from "./OrderTemplateModal/OrderTemplateModal";
import Toast from "../../components/Toast/Toast";
import { getOrderTemplates, saveOrderTemplate, deleteOrderTemplate } from "../../services/OrderTemplatesService";
import SearchSymbol from "../../components/SearchSymbol/SearchSymbol";
import NewOrderTemplateButton from "./NewOrderTemplateButton";

function OrderTemplates() {

    const defaultLocation = useLocation();

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page');
    }

    const history = useHistory();

    const [orderTemplates, setOrderTemplates] = useState([]);
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(getPage());
    const [notification, setNotification] = useState({ type: '', text: '' });

    const [editOrderTemplate, setEditOrderTemplate] = useState(DEFAULT_ORDER_TEMPLATE);

    useEffect(() => {
        return history.listen(location => setPage(getPage(location)));
    }, [history])

    useEffect(() => {
        const token = localStorage.getItem('token');
        getOrderTemplates(search, page || 1, token)
            .then(result => {
                setCount(result.count);
                setOrderTemplates(result.rows);
                setEditOrderTemplate(result.rows[0]);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }, [page, search])

    function onNewOrderTemplateClick() {
        setEditOrderTemplate(DEFAULT_ORDER_TEMPLATE);
    }

    function onEditOrderTemplateClick(event) {
        const id = event.target.id.replace('edit', '');
        setEditOrderTemplate(orderTemplates.find(a => a.id == id));
    }

    function onDeleteOrderTemplateClick(event) {
        const token = localStorage.getItem('token');
        const id = event.target.id.replace('delete', '');
        deleteOrderTemplate(id, token)
            .then(() => history.go(0))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onOrderTemplateSubmit(event) {
        history.go(0);
    }

    function onSearchChange(event) {
        setSearch(event.target.value);

    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h4 className="h4">Order Templates</h4>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <NewOrderTemplateButton onClick={onNewOrderTemplateClick} />
                        </div>
                        <div className="btn-group ms-2 ms-lg-3">
                            <SearchSymbol onChange={onSearchChange} placeholder={search} />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Side</th>
                                <th className="border-gray-200">Type</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orderTemplates && orderTemplates.length
                                    ? orderTemplates.map(ot => (<OrderTemplateRow key={ot.id} data={ot} onEditClick={onEditOrderTemplateClick} onDeleteClick={onDeleteOrderTemplateClick} />))
                                    : <React.Fragment />
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
            </main>
            <OrderTemplateModal data={editOrderTemplate} onSubmit={onOrderTemplateSubmit} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default OrderTemplates;