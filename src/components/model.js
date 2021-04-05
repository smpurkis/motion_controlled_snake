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
    model.add(tf.layers.dense({ units: 1024, inputShape: [1024] }))
    // model.add(tf.layers.dense({units: 500}))
    // model.add(tf.layers.dense({units: 200}))
    model.add(tf.layers.dense({ units: 4 }))
    model.add(tf.layers.activation({ activation: "softmax" }))
    model.compile({ loss: tf.losses.softmaxCrossEntropy, optimizer: tf.train.adam(0.0001), metrics: ['accuracy'] });
    model.summary()
    return model
}

async function preProcess(image, mobilenet) {
    let infer = await mobilenet.infer(image, true)
    return infer
}

async function postProcess(oneHotPrediction) {
    return await oneHotPrediction.argMax(1).data()
}

export async function predict(image, model, mobilenet) {
    const predictionArray = ["up", "down", "left", "right"]
    let mobilenetOutput = await preProcess(image, mobilenet)
    let oneHotPrediction = await model.predict(mobilenetOutput)
    let predictionIndex = await postProcess(oneHotPrediction)
    let prediction = predictionArray[predictionIndex]
    return prediction
}

async function getTensorsAndTargets(state, mobilenet) {
    let tensorsTargets = {}

    let infer_up = await mobilenet.infer(state.up, true);
    let infer_down = await mobilenet.infer(state.down, true);
    let infer_left = await mobilenet.infer(state.left, true);
    let infer_right = await mobilenet.infer(state.right, true);

    // console.log("states");
    // tf.max(state.up).print()
    // tf.max(state.up).print()
    // tf.max(state.down).print()
    // tf.max(state.left).print()
    // tf.max(state.right).print()
    // console.log("infers");
    // tf.max(infer_up).print()
    // tf.max(infer_up).print()
    // tf.max(infer_down).print()
    // tf.max(infer_left).print()
    // tf.max(infer_right).print()

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
    const history = await model.fit(tensorsTargets.tensors, tensorsTargets.targets, { epochs: 10 })
    console.log("history: ", history)
    console.log("finished training")
    let predictions = model.predict(tensorsTargets.tensors);
    predictions.print()
}

export async function run_tf(state, mobilenet) {
    mobilenet = await mobilenet
    let model = defineModel()
    let tensorsTargets = await getTensorsAndTargets(state, mobilenet)
    await fitModel(model, tensorsTargets)
    let controlPrediction = model.predict(
        await preProcess(state.control, mobilenet)
    )
    controlPrediction.print()
    let t = await postProcess(controlPrediction)
    console.log(["up", "down", "left", "right"][t]);
    return {
        mobilenet: mobilenet, 
        model: model
    }
}

export async function load_mobilenet() {
    return await mobilenet.load()
}