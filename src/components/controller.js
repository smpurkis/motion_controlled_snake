import React, {useRef} from "react";
import WebcamCapture from './WebcamCapture';
import {connect} from "react-redux";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

function defineModel() {
    const model = tf.sequential();
    // model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    // model.add(tf.layers.conv2d({kernelSize: 3, filters: 4, strides: 1, padding: "same", inputShape: [200, 200, 3]}))
    // model.add(tf.layers.reLU())
    // model.add(tf.layers.conv2d({kernelSize: 3, filters: 4, strides: 1, padding: "same"}))
    // model.add(tf.layers.reLU())
    // model.add(tf.layers.conv2d({kernelSize: 3, filters: 4, strides: 1, padding: "same"}))
    // model.add(tf.layers.reLU())
    // model.add(tf.layers.conv2d({kernelSize: 3, filters: 4, strides: 1, padding: "same"}))
    // model.add(tf.layers.reLU())
    // model.add(tf.layers.flatten())
    model.add(tf.layers.dense({units: 1024, inputShape: [1024]}))
    // model.add(tf.layers.dense({units: 500}))
    // model.add(tf.layers.dense({units: 200}))
    model.add(tf.layers.dense({units: 4}))
    model.add(tf.layers.activation({activation: "softmax"}))
    model.compile({loss: tf.losses.softmaxCrossEntropy, optimizer: tf.train.adam(0.0001), metrics: ['accuracy']});
    model.summary()
    return model
}

async function getTensorsAndTargets(state, mobilenet) {
    mobilenet = await mobilenet
    let tensorsTargets = {}

    let infer_up = await mobilenet.infer(state.up, true);
    let infer_down = await mobilenet.infer(state.down, true);
    let infer_left = await mobilenet.infer(state.left, true);
    let infer_right = await mobilenet.infer(state.right, true);

    console.log("states");
    tf.max(state.up).print()
    tf.max(state.up).print()
    tf.max(state.down).print()
    tf.max(state.left).print()
    tf.max(state.right).print()
    console.log("infers");
    tf.max(infer_up).print()
    tf.max(infer_up).print()
    tf.max(infer_down).print()
    tf.max(infer_left).print()
    tf.max(infer_right).print()

    tensorsTargets.tensors = tf.concat([infer_up, infer_down, infer_left, infer_right])
    tensorsTargets.tensors = tensorsTargets.tensors.reshape([4, 1024])
    // tensorsTargets.tensors = tf.concat([state.up, state.down, state.left, state.right])
    // tensorsTargets.tensors = tensorsTargets.tensors.reshape([4, 200, 200, 3])
    tensorsTargets.targets = tf.tensor([0, 1, 2, 3], [4], "int32")
    tensorsTargets.targets = tf.oneHot(tensorsTargets.targets, 4)
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

async function run_tf(state, mobilenet) {
    let model = defineModel()
    let tensorsTargets = await getTensorsAndTargets(state, mobilenet)
    await fitModel(model, tensorsTargets)
}

async function load_mobilenet() {
    return await mobilenet.load()
}


function Controller(props) {
    let trainingInProgress = useRef(false)
    let mobilenet = load_mobilenet()
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
        run_tf(props.state, mobilenet)
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