import React, { useRef, useEffect, useState } from "react";
import WebcamCapture from './WebcamCapture';
import { connect } from "react-redux";
import { load_mobilenet, run_tf } from "./model";
import userEvent from "@testing-library/user-event";



function Controller(props) {
    let trainingInProgress = useRef(false)
    let [rerender, setRerender] = useState(true)
    let mobilenet = useRef({})
    
    useEffect(() => {
        mobilenet.current = load_mobilenet()
    }, [])

    const check_images = () => {
        return !!(props.state.hasOwnProperty("up")
            && props.state.hasOwnProperty("down")
            && props.state.hasOwnProperty("left")
            && props.state.hasOwnProperty("right"));
    }

    useEffect(() => {
        setTimeout(() => {
            setRerender(!rerender)
        }, 1000)
    }, [rerender])

    async function trainDispatchModels() {
        let models = await run_tf(props.state, mobilenet.current)
        props.dispatch({
            type: "models",
            models: models
        })
        props.dispatch({
            type: "play",
            action: true
        })
    }

    let images_exist = check_images()
    if (images_exist && !trainingInProgress.current) {
        trainingInProgress.current = true;
        trainDispatchModels()
    }

    const controlContainer = {
        display: "grid",
        position: "relative",
        width: "600px",
        height: "463px",
    };
    const cameraBlock = {
        display: "grid",
        position: "absolute"
    }
    return (
        <div>
            <h3>Controls</h3>
            <div style={controlContainer}>
                <div style={{ ...cameraBlock, top: "0", left: "33.5%" }}>
                    <WebcamCapture id="up" />
                </div>
                <div style={{ ...cameraBlock, bottom: "0", left: "0%" }}>
                    <WebcamCapture id="left" />
                </div>
                <div style={{ ...cameraBlock, bottom: "0", right: "0%" }}>
                    <WebcamCapture id="right" />
                </div>
                <div style={{ ...cameraBlock, bottom: "6.6%", left: "33.5%" }}>
                    <WebcamCapture id="controller" />
                </div>
                <div style={{ ...cameraBlock, bottom: "-50%", left: "33.5%" }}>
                    <WebcamCapture id="down" />
                </div>
                <div style={{ ...cameraBlock, top: "-20%", left: "-10%" }}>
                </div>
            </div>
        </div>
    );
}


const mapStateToProps = (state) => ({
    state: state
})


export default connect(mapStateToProps)(Controller)