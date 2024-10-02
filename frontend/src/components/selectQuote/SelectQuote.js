import React, { useState } from 'react';

const DEFAULT_QUOTE_PROPERTY = "defaultQuote";

/**
 * props:
 * - onChange
 * - noFavorites
 * 
 */
function SelectQuote(props) {
    const [defautQuote, setDefautQuote] = useState(getDefaultQuote());

    return (
        <select id="selectQuote" className="form-select" defaultValue={defautQuote} onChange={props.onChange}>
            {
                props.noFavorites
                    ? <React.Fragment />
                    : (<option value="FAVORITES">Favorites</option>)
            }
            <option value="BNB">BNB</option>
            <option value="BRL">BRL</option>
            <option value="BTC">BTC</option>
            <option value="USD">USD</option>
            <option value="USDT">USDT</option>
        </select>
    )
}

export function filterSymbolObjects(symbols, quote) {
    return symbols.filter(s => {
        if (quote === 'FAVORITES')
            return s.isFavorite;
        else
            return s.symbol.endsWith(quote)
    })
}

export function filterSymbolNames(symbols, quote) {
    return filterSymbolObjects(symbols, quote).map(s => s.symbol);
}

export function setDefaultQuote(quote) {
    localStorage.setItem(DEFAULT_QUOTE_PROPERTY, quote);
}

export function getDefaultQuote() {
    return localStorage.getItem(DEFAULT_QUOTE_PROPERTY) ? localStorage.getItem(DEFAULT_QUOTE_PROPERTY) : "USD"
}

export default SelectQuote;