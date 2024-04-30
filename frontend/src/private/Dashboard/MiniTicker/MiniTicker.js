import React, { useState, useEffect } from "react";
import SelectQuote, { filterSymbolNames, getDefaultQuote } from "../../../components/selectQuote/SelectQuote";
import TickerRow from "./TickerRow";
import { getSymbols } from "../../../services/SymbolsService";
import { useHistory } from "react-router-dom";
import  "../Dashboard";

/**
 * props:
 * - data
*/
function MiniTicker(props) {

    const history = useHistory();
    const [symbols, setSymbols] = useState([]);
    const [quote, setQuote] = useState(getDefaultQuote());

    useEffect(() => {
        const token = localStorage.getItem('token');
        getSymbols(token)
            .then(symbols => setSymbols(filterSymbolNames(symbols, quote)))
            .catch(err => {
                if (err.response && err.response.status === 401)
                    return history.push('/');
                console.error(err);
            })

    }, [quote])

    function onQuoteChange(event) {
        setQuote(event.target.value);
    }

    if (!props.data || !props) return (<React.Fragment />);

    return (
        <div className="col-12 mb-4">
            <div className="card border-0 shadow">
                <div className="card_header">
                    <div className="row">
                        <div className="col">
                            <h2 className="fs-5 fw-bold mb-0">Market 24h</h2>
                        </div>
                        <div className="col offset-md-3">
                            <SelectQuote onChange={onQuoteChange} />
                        </div>
                    </div>
                </div>
                <div className="table-responsive divScroll">
                    <table className="table align-items-center table-flush talbe-sm table-hover tableFixHead">
                        <thead className="thead-light">
                            <tr>
                                <th className="border-botton" scope="col">SYMBOL</th>
                                <th className="border-botton col-2" scope="col">CLOSE</th>
                                <th className="border-botton col-2" scope="col">OPEN</th>
                                <th className="border-botton col-2" scope="col">HIGH</th>
                                <th className="border-botton col-2" scope="col">LOW</th>
                            </tr>
                        </thead>
                        <tbody className="tbody-light">
                            {
                                symbols.map(item => (
                                    <TickerRow key={item} symbol={item} data={props.data[item]} />
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default MiniTicker;