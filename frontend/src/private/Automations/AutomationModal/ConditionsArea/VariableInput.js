import React, { useState, useEffect, useRef } from "react";

/***
 * props:
 * - selectedIndex
 * - indexes
 * - onAddClick
 */
function VariableInput(props) {

    const variableRef = useRef('');

    const [indexes, setIndexes] = useState({});
    const [index, setIndex] = useState({});
    const [variable, setVariable] = useState({});
    const [operator, setOperator] = useState('==');

    useEffect(() => {
        setIndex(props.selectedIndex);
        setVariable(props.selectedIndex.example);
        variableRef.current.value = '';
    }, [props.selectedIndex])

    useEffect(() => {
        setIndexes(props.indexes)
    }, [props.indexes])

    function onOperatorChange(event) {
        setOperator(event.target.value);
    }

    function onVariableChange(event) {
        const value = event.target.value;
        const index = props.indexes.find(k => value.endsWith(k.variable))
        if (index && !value.endsWith('WALLET')) {
            /*const split = value.split('.');
            const prop = split.length > 0 ? value.replace(split[0], '') : '';
            setVariable(`MEMORY['${index.symbol}:${split[0]}']${prop}`);*/
            setVariable(index.eval);
        }
        else {
            setVariable(value);
        }
    }

    function getOptionText(symbol, variable) {
        const text = variable === 'WALLET' ? `${symbol}:${variable}` : variable
        return text;
    }

    function getExpressionText() {
        const value = typeof index.example === 'string' ? `'${variable}'` : variable;
        return `${index.symbol}:${index.variable} ${operator.replace('==', '=')} ${value}`;
    }

    function onAddClick(event) {
        //const value = typeof index.example === 'string' ? `'${variable}'` : variable;
        const value = index.example === 'number' || !isNaN(parseFloat(index.example)) ? variable : `'${variable}'`;
        const condition = {
            eval: `${index.eval}${operator}${value}`,
            text: getExpressionText()
        }
        props.onAddClick({ target: { id: 'condition', value: condition } })
    }

    return (
        <React.Fragment>
            <div className="input-group input-group-merge mb-2">
                <span className="input-group-text bg-secondary">
                    is
                </span>
                <select id="operator" className="form-select" onChange={onOperatorChange}>
                    {
                        typeof index.example === 'number' || !isNaN(parseFloat(index.example))
                            ? (
                                <React.Fragment>
                                    <option value=">">greater than</option>
                                    <option value=">=">greater or equals</option>
                                    <option value="<">less than</option>
                                    <option value="<=">less or equals</option>
                                </React.Fragment>
                            )
                            : (<React.Fragment />)
                    }
                    <option value="==">equals</option>
                    <option value="!=">not equals</option>
                </select>

                <input type="text" ref={variableRef} id="variable" list="variables" className="form-select" onChange={onVariableChange} placeholder={`${index.example}`} />
                <datalist id="variables">
                    {
                        indexes && Array.isArray(indexes)
                            ? (
                                indexes.filter(i => i.eval !== index.eval).map(item => (
                                    <option key={`${item.symbol}:${item.variable}`}>
                                        {getOptionText(item.symbol, item.variable)}
                                    </option>
                                ))
                            )
                            : <option value="">NO INDEXES</option>
                    }
                </datalist>
                <button type="button" className="btn btn-secondary" onClick={onAddClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon icon-xs" ><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg>

                </button>
            </div>
        </React.Fragment>
    );

}

export default VariableInput;