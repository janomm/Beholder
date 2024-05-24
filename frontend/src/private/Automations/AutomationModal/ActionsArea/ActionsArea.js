import React, { useState, useEffect } from "react";
import ActionType from "./ActionType";
import ActionBadge from "./ActionBadge";

/***
 * props:
 * - actions
 * - onChange
 */
function ActionsArea(props) {

    const DEFAULT_ACTION = {
        type: 'ALERT_EMAIL'
    }

    const [newAction, setNewAction] = useState(DEFAULT_ACTION);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        setActions(props.actions ? props.actions : []);
        setNewAction(DEFAULT_ACTION);
    }, [props.actions])

    function onInputChange(event) {
        setNewAction(prevState => ({ ...prevState, [event.target.id]: event.target.value }))
        if (props.onChange) props.onChange(event);
    }

    function onAddClick(event) {
        const alreadyExists = actions.some(a => a.type === newAction.type);
        if (alreadyExists) return;

        actions.push(newAction);
        setActions(actions);
        setNewAction(DEFAULT_ACTION);
        if (props.onChange) props.onChange({ target: { id: 'actions', value: actions } })
    }

    function onRemoveActionClick(event) {
        const index = actions.find(a => a.id === event.target.id);
        actions.splice(index, 1);
        if (props.onChange) props.onChange({ target: { id: 'actions', value: actions } })
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12 my-3">
                    <div className="input-group input-group-merge">
                        <ActionType type={newAction.type} onChange={onInputChange} />
                        <button type="button" className="btn btn-secondary" onClick={onAddClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs" ><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            {
                actions && actions.length > 0
                    ? (
                        <div className="divScrollBadges">
                            <div className="d-inline-flex flex-row alignt-content-start">
                                {
                                    actions.map(action => (<ActionBadge key={action.type + ":" + action.id} action={action} onClick={onRemoveActionClick} />))
                                }
                            </div>
                        </div>
                    )
                    : <React.Fragment />
            }
        </React.Fragment>
    );
}

export default ActionsArea;