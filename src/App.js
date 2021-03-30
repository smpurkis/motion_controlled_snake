import './App.css';

import React from "react";
import Controller from './components/controller';
import Snake from './components/snake';


function title() {
    return (
        <div>
            <h1>Snake Game!</h1>
            {/*<p>With some interesting Controllers</p>*/}
        </div>
    )
}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <div>{title()}</div>
                {/* eslint-disable-next-line react/style-prop-object */}
                <div class="container">
                    <Snake/>
                    <Controller/>
                </div>
            </header>
        </div>
    );
}


export default App;
