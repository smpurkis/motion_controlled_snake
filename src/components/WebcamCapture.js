import Webcam from "react-webcam";
import * as tf from '@tensorflow/tfjs';

import React, {useCallback, useRef, useState} from "react";
import {connect} from "react-redux";


function WebcamCapture(props) {
    const webcamRef = useRef(null);
    const id = useRef(props.id);
    let [imgSrc, setImgSrc] = useState(null);
    let height = 200;
    let width = 200;
    let [showImg, setShowImg] = useState(false);
    let im = document.getElementById("img");

    async function loadImg(url) {
        let img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = url
        img.height = height
        img.width = width
        img = await img
        let tensor = tf.browser.fromPixels(img)
        tf.max(tensor).print()
        tensor.print()
        props.dispatch({
            type: id.current,
            tensor: tensor
        })
    }

    const capture = useCallback((e) => {
        if (!showImg) {
            console.log(id)
            let imageSrc = webcamRef.current.getScreenshot();
            loadImg(imageSrc)
            // let img = new Image()
            // img.height = height
            // img.width = width
            // img.crossOrigin = 'anonymous'
            // img.src = imageSrc
            // let tensor = tf.browser.fromPixels(img)
            // tf.max(tensor).print()
            // props.dispatch({
            //     type: id.current,
            //     tensor: tensor
            // })
            setImgSrc(imageSrc);
            setShowImg(true);
        } else {
            setImgSrc(null);
            setShowImg(false);
        }
    })

    return (
        <>
            {!showImg && (<Webcam
                id={id}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    height: height,
                    width: width
                }}
            />)}
            {showImg && (
                <img
                    id="img"
                    src={imgSrc}
                    alt=""
                />
            )}
            <button onClick={capture} style={{
                height: "30px"
            }}>Capture
            </button>
        </>
    );
}

const mapStateToProps = (state) => ({
    state: state
})

export default connect(mapStateToProps)(WebcamCapture);