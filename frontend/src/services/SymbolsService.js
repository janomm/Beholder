import axios from 'axios';

const SYMBOLS_URL = `${process.env.REACT_APP_API_URL}/symbols/`;

export async function getSymbols(token) {
    const headers = {
        'authorization': token
    }
    const response = await axios.get(SYMBOLS_URL, { headers });
    return response.data;
}

export async function searchSymbols(search,onlyFavotires, page, token){
    const headers = {
        'authorization': token
    }
    const response = await axios.get(`${SYMBOLS_URL}?search=${search}&onlyFavorites=${onlyFavotires}&page=${page}`, { headers });
    return response.data;
}

export async function getSymbol(symbol, token) {
    const symbolUrl = `${SYMBOLS_URL}${symbol}`;
    const headers = {
        'authorization': token
    }
    const response = await axios.get(symbolUrl, { headers });
    return response.data;
}

export async function updateSymbol(symbol, token) {
    const symbolUrl = `${SYMBOLS_URL}${symbol.symbol}`;
    const headers = {
        'authorization': token
    }
    const response = await axios.patch(symbolUrl, symbol, { headers });
    return response.data;
}

export async function syncSymbols(token) {
    const symbolsUrl = `${SYMBOLS_URL}sync`;
    const headers = {
        'authorization': token
    }
    const response = await axios.post(symbolsUrl, {}, { headers });
    return response.data;
}
