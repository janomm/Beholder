import React, { useState, useEffect } from "react";

/***
 * props:
 * - indexes
 * - onChange
 */
function IndexSelect(props) {

    const [indexes, setIndexes] = useState([]);

    useEffect(() => {
        if (props.indexes && Array.isArray(props.indexes)) {
            setIndexes(props.indexes);
            if (props.indexes.length > 0)
                props.onChange({ target: { id: 'eval', value: props.indexes[0].eval } });
        }
    }, [props.indexes])

    function getOptionText(symbol, variable) {
        const text = variable === 'WALLET' ? `${symbol}:${variable}` : variable
        return text;
    }

    return (
        <React.Fragment>
            <div className="input-group input-group-merge mb-2">
                <span className="input-group-text bg-secondary">
                    When
                </span>
                <select id="eval-old" className="form-select" onChange={props.onChange}>
                    {
                        indexes && indexes.length > 0 ?
                            (
                                //{symbols.map(s => <option key={s} value={s}>{s}</option>)}
                                indexes.map(item => (
                                    <option key={`${item.symbol}:${item.variable}`} value={item.eval}>
                                        {getOptionText(item.symbol, item.variable)}
                                    </option>
                                ))
                            )
                            : <option value="">NO KEYS</option>
                    }
                </select>
            </div>
        </React.Fragment>
    );
}

export default IndexSelect;