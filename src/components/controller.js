import React, {useRef} from "react";
import WebcamCapture from './WebcamCapture';
import {connect} from "react-redux";
import * as tf from "@tensorflow/tfjs";

function defineModel() {
    const model = tf.sequential();
    // model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    model.add(tf.layers.conv2d({kernelSize: 3, filters: 8, strides: 1, padding: "same", inputShape: [200, 200, 3]}))
    model.add(tf.layers.reLU())
    model.add(tf.layers.conv2d({kernelSize: 3, filters: 8, strides: 1, padding: "same"}))
    model.add(tf.layers.reLU())
    model.add(tf.layers.flatten())
    model.add(tf.layers.dense({units: 1}))
    model.add(tf.layers.activation({activation: "linear"}))
    model.compile({loss: tf.losses.meanSquaredError, optimizer: 'adam', metrics: ['accuracy']});
    model.summary()
    return model
}

function getTensorsAndTargets(state) {
    let tensorsTargets = {}
    tf.max(state.up).print()
    tensorsTargets.tensors = tf.concat([state.up, state.down, state.left, state.right])
    tensorsTargets.tensors = tensorsTargets.tensors.reshape([4, 200, 200, 3])
    tensorsTargets.targets = tf.tensor([0, 1, 2, 3], [4])
    return tensorsTargets
}

async function fitModel(model, tensorsTargets) {
    // Train the model using the data.
    console.log("training network")
    const history = await model.fit(tensorsTargets.tensors, tensorsTargets.targets, {epochs: 10})
    console.log("history: ", history)
    console.log("finished training")
    model.predict(tensorsTargets.tensors).print();
}

function run_tf(state) {
    let model = defineModel()
    let tensorsTargets = getTensorsAndTargets(state)
    fitModel(model, tensorsTargets)
}


function Controller(props) {
    let trainingInProgress = useRef(false)
    let props2 = useRef(props)
    console.log("props: ", props)

    const check_images = () => {
        return !!(props.state.hasOwnProperty("up")
            && props.state.hasOwnProperty("down")
            && props.state.hasOwnProperty("left")
            && props.state.hasOwnProperty("right"));
    }

    let images_exist = check_images()
    if (images_exist && !trainingInProgress.current) {
        trainingInProgress.current = true;
        run_tf(props.state)
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
                <div style={{...cameraBlock, top: "0", left: "33.5%"}}>
                    <WebcamCapture id="up"/>
                </div>
                <div style={{...cameraBlock, bottom: "0", left: "0%"}}>
                    <WebcamCapture id="left"/>
                </div>
                <div style={{...cameraBlock, bottom: "0", right: "0%"}}>
                    <WebcamCapture id="right"/>
                </div>
                <div style={{...cameraBlock, bottom: "0", left: "33.5%"}}>
                    <WebcamCapture id="controller"/>
                </div>
                <div style={{...cameraBlock, bottom: "-50%", left: "33.5%"}}>
                    <WebcamCapture id="down"/>
                </div>
                <div style={{...cameraBlock, top: "-20%", left: "-10%"}}>
                </div>
            </div>
        </div>
    );
}


const mapStateToProps = (state) => ({
    state: state
})


export default connect(mapStateToProps)(Controller)