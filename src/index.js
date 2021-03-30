import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {createStore} from "redux";
import {Provider} from "react-redux";

const reducer = (state, action) => {
    switch (action.type) {
        default:
            state = {
                ...state,
                "control": action.tensor
            }
            break;
        case "up":
            state = {
                ...state,
                "up": action.tensor
            }
            break;
        case "down":
            state = {
                ...state,
                "down": action.tensor
            }
            break;
        case "left":
            state = {
                ...state,
                "left": action.tensor
            }
            break;
        case "right":
            state = {
                ...state,
                "right": action.tensor
            }
    }
    return state
}

const store = createStore(reducer, {})

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
