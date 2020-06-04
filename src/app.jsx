import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './app.scss';
import Encrypt from './encrypt.jsx';
import Decrypt from './decrypt.jsx';

const App = () => {
    return (
        <div className='d-flex justify-content-center'>
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' component={Encrypt} />
                    <Route exact path='/decrypt' component={Decrypt} />
                    <Route exact path='/encrypt' component={Encrypt} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;