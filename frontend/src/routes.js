import React from 'react';
import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import Login from './public/Login/Login';
import Settings from './private/Settings/Settings';
import Dashboard from './private/Dashboard/Dashboard';
import Orders from './private/Orders/Orders';
import Monitors from './private/Monitors/Monitors';
import Automations from './private/Automations/Automations';
import OrderTemplates from './private/OrderTemplates/OrderTemplates';
import Reports from './private/Reports/Reports';

function Routes() {

    function PrivateRoute({ children, ...rest }) {
        return (
            <Route {...rest} render={() => {
                return localStorage.getItem('token')
                    ? children
                    : <Redirect to="/" />
            }} >

            </Route>
        )

    }

    return (
        <BrowserRouter>
            <Route path="/" exact>
                <Login />
            </Route>
            <PrivateRoute path="/settings">
                <Settings />
            </PrivateRoute>
            <PrivateRoute path="/dashboard">
                <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/monitors">
                <Monitors />
            </PrivateRoute>
            <PrivateRoute path="/automations">
                <Automations />
            </PrivateRoute>
            <PrivateRoute path="/ordertemplates/:symbol?">
                <OrderTemplates />
            </PrivateRoute>
            <PrivateRoute path="/orders/:symbol?">
                <Orders />
            </PrivateRoute>
            <PrivateRoute path="/reports/:symbol?">
                <Reports />
            </PrivateRoute>
        </BrowserRouter>
    )
}

export default Routes;