import React, { useEffect, useState } from 'react';
import ActionBadge from './ActionBadge';
import ActionType from './ActionType';
import { getOrderTemplates } from '../../../../services/OrderTemplatesService';

/**
 * props:
 * - symbol
 * - actions
 * - onChange
 */
function ActionsArea(props) {

    const DEFAULT_ACTION = {
        type: 'ALERT_EMAIL',
        orderTemplateId: null,
        orderTemplateName: '',
    }

    const [newAction, setNewAction] = useState(DEFAULT_ACTION);
    const [actions, setActions] = useState([]);
    const [orderTemplates, setOrderTemplates] = useState([]);

    function onInputChange(event) {
        if (event.target.id === 'orderTemplateId') {
            const orderTemplateId = parseInt(event.target.value);
            const orderTemplate = orderTemplates.find(ot => ot.id === orderTemplateId);
            setNewAction(prevState => ({
                ...prevState,
                orderTemplateName: orderTemplate.name,
                orderTemplateId
            }));
        }
        else
            setNewAction(prevState => ({ ...prevState, [event.target.id]: event.target.value }));

        if (props.onChange) props.onChange(event);
    }

    useEffect(() => {
        if (!props.symbol) return;

        const token = localStorage.getItem('token');

        getOrderTemplates(props.symbol, 1, token)
            .then(result => setOrderTemplates(result.rows))
            .catch(err => console.error(err.response ? err.response.data : err.message));

    }, [props.symbol])

    useEffect(() => {
        setActions(props.actions);
        setNewAction(DEFAULT_ACTION);
    }, [props.actions])

    function onAddClick(event) {
        if (newAction.type === 'ORDER') {
            if (!newAction.orderTemplateId) return;
            newAction.id = 'ot' + newAction.orderTemplateId;

            const alreadyExists = actions.some(a => a.id === newAction.id);
            if (alreadyExists) return;
        } else {
            const alreadyExists = actions.some(a => a.type === newAction.type);
            if (alreadyExists) return;
        }

        actions.push(newAction);
        setActions(actions);
        if (props.onChange) props.onChange({ target: { id: 'actions', value: actions } });
    }

    function onRemoveActionClick(event) {
        const index = actions.findIndex(a => a.id == event.target.id);
        actions.splice(index, 1);
        if (props.onChange) props.onChange({ target: { id: 'actions', value: actions } });
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12 my-3">
                    <div className="input-group input-group-merge">
                        <ActionType type={newAction.type} onChange={onInputChange} />
                        {
                            newAction.type === 'ORDER' && orderTemplates
                                ?
                                <select id="orderTemplateId" className="form-select" onChange={onInputChange}>
                                    <option value="0">Select one...</option>
                                    {
                                        orderTemplates.map(ot => (<option key={ot.id} value={ot.id}>{ot.name}</option>))
                                    }
                                </select>
                                : <React.Fragment></React.Fragment>
                        }
                        <button type="button" className="btn btn-secondary" onClick={onAddClick}>
                            <svg className="icon icon-xs" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div >
            {
                actions && actions.length > 0
                    ? (
                        <div className="divScrollBadges">
                            <div className="d-inline-flex flex-row align-content-start">
                                {
                                    actions.map(action => (<ActionBadge key={action.type + ":" + action.id} action={action} onClick={onRemoveActionClick} />))
                                }
                            </div>
                        </div>
                    )
                    : <React.Fragment></React.Fragment>
            }
        </React.Fragment >
    )
}

export default ActionsArea;