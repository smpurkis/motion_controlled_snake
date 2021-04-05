import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { createStore } from "redux";
import { Provider } from "react-redux";

const reducer = (state, action) => {
    switch (action.type) {
        default:
            state.control = action.tensor
            break;
        case "up":
            state.up = action.tensor
            break;
        case "down":
            state.down = action.tensor
            break;
        case "left":
            state.left = action.tensor
            break;
        case "right":
            state.right = action.tensor
            break
        case "models":
            state.models = action.models
            break
        case "play":
            state.play = action.action
            break
    }
    return state
}

const store = createStore(reducer, {})

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()