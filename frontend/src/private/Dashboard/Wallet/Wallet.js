import React, { useState, useEffect } from "react";
import { getBalance } from "../../../services/ExchangeServices";
import "../Dashboard";

/**
 * props:
 * - data
 * - onUpdate
*/
function Wallet(props) {

    const [balances, setBalances] = useState([]);
    const [usd, setUsd] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        getBalance(token)
            .then(info => {
                const balances = Object.entries(info).map(item => {
                    return {
                        symbol: item[0],
                        available: item[1].available,
                        onOrder: item[1].onOrder
                    }
                })

                if (props.onUpdate) props.onUpdate(balances);
                setBalances(balances);
                setUsd(info.usdEstimate);
            })
            .catch(err => console.error(err.response ? err.response.data : err.message));

    }, [props.data])

    function getBalanceCall() {
        const token = localStorage.getItem("token");

        getBalance(token)
            .then((info) => {
                const balance = Object.entries(info).map(item => {
                    return {
                        symbol: item[0],
                        available: item[1].available,
                        onOrder: item[1].onOrder
                    }
                })
                    .sort((a, b) => {
                        if (a.symbol > b.symbol) return 1;
                        if (a.symbol < b.symbol) return -1;
                        return 0;
                    });

                if (props.onUpdate)
                    props.onUpdate(balances);

                setBalances(balances);
            })
            .catch(err => console.error(err.response ? err.response.data : err.message));
    }

    useEffect(() => {
        if (props.data && Object.entries(props.data).length) {
            setBalances(props.data);
            const usd = props.data.find(s => s.symbol === 'usdEstimate');
            setUsd(usd);
        }
        else
            getBalanceCall();
    }, [props.data])

    return (
        <div className="col-md-6 col-sm-12 mb-4">
            <div className="card border-0 shadow">
                <div className="card-header">
                    <div className="row">
                        <div className="col">
                            <h2 className="fs-5 fw-bold-mb-0">Wallet</h2>
                        </div>
                        <div className="col">
                            {
                                usd ? "~USD " + usd : <React.Fragment />
                            }
                        </div>
                    </div>
                </div>
                <div className="table-responsive divScroll">
                    <table className="table align-items-center table-flush table-sm table-hover tableFixHead">
                        <thead className="thead-light">
                            <tr>
                                <th className="border-bottom" scope="col">SYMBOL</th>
                                <th className="border-bottom col-2" scope="col">FREE</th>
                                <th className="border-bottom col-2" scope="col">LOCK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                balances.map(item =>
                                    !parseFloat(item.available) && !parseFloat(item.onOrder)
                                        ? <React.Fragment />
                                        :
                                        (<tr key={`wallet${item.symbol}`}>
                                            <td className="text-gray-900">{item.symbol}</td>
                                            <td className="text-gray-900">{item.available.substring(0, 8)}</td>
                                            <td className="text-gray-900">{item.onOrder.substring(0, 8)}</td>
                                        </tr>)
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default Wallet;