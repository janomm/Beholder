import React from "react";

/***
 * props:
 * - data
 * - onEditClick
 * - onStopClick
 * - onStartClick
 * - onDeleteClick
 */
function AutomationRow(props) {
    function getActiveClass(isActive) {
        return isActive ? "text-success" : "text-danger";
    }

    function getActiveText(isActive) {
        return isActive ? "RUNNING" : "STOPPED";
    }
    return (
        <tr>
            <td>
                {props.data.symbol}
            </td>
            <td>
                {props.data.name}
            </td>
            <td>
                <span className={getActiveClass(props.data.isActive)}>
                    {getActiveText(props.data.isActive)}
                </span>
            </td>
            <td>
                {
                    <button id={"edit" + props.data.id} type="button" className="btn btn-secondary btn-xs ms-2" title="Edit this Automation" data-bs-toggle="modal" data-bs-target="#modalAutomation" onClick={props.onEditClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                    </button>
                }
                {
                    props.data.isActive
                        ? <button id={"stop" + props.data.id} type="button" className="btn btn-danger btn-xs ms-2" title="Stop this Automation" onClick={props.onStopClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2">
                                <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
                            </svg>
                        </button>
                        : <React.Fragment />
                }
                {
                    !props.data.isActive
                        ? <button id={"start" + props.data.id} type="button" className="btn btn-success btn-xs ms-2" title="Start this Automation" onClick={props.onStartClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2">
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </button>
                        : <React.Fragment />
                }
                {
                    !props.data.isActive
                        ? <button id={"delete" + props.data.id} type="button" className="btn btn-danger btn-xs ms-2" title="Delete this Automation" onClick={props.onDeleteClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs me-2">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        : <React.Fragment />
                }
            </td>
        </tr>
    );
}

export default AutomationRow;