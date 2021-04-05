import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { predict } from "./model";

function Snake(props) {

    const containerStyle = {
        height: "1000px",
        width: "1000px"
    }
    const positionRange = Array.from(Array(parseInt(containerStyle.height) / 20).keys()).map(x => x * 20)
    const getRandomPosition = () => {
        let randomTopPosition = positionRange[Math.floor(Math.random() * positionRange.length)]
        let randomLeftPosition = positionRange[Math.floor(Math.random() * positionRange.length)]
        return [randomTopPosition, randomLeftPosition]
    }

    let [score, setScore] = useState(0)
    let [snakeTop, setSnakeTop] = useState(0)
    let [snakeLeft, setSnakeLeft] = useState(0)
    let [dotLeft, setDotLeft] = useState(0)
    let [dotTop, setDotTop] = useState(0)
    let tailLength = useRef(0)
    let lastPositions = useRef([])
    let [snakeDirection, setSnakeDirection] = useState("down")

    let [rerender, setRerender] = useState(true)


    function moveSnake() {
        if (snakeDirection === "down") {
            snakeTop = snakeTop + 20
        } else if (snakeDirection === "up") {
            snakeTop = snakeTop - 20
        } else if (snakeDirection === "left") {
            snakeLeft = snakeLeft - 20
        } else if (snakeDirection === "right") {
            snakeLeft = snakeLeft + 20
        }
        if (snakeTop > 980 || snakeTop < 0) {
            snakeTop = 980 - Math.min(Math.max(snakeTop, 0), 980)
        }
        if (snakeLeft > 980 || snakeLeft < 0) {
            snakeLeft = 980 - Math.min(Math.max(snakeLeft, 0), 980)
        }
        setSnakeTop(() => snakeTop)
        setSnakeLeft(() => snakeLeft)
        lastPositions.current = [{
            top: snakeTop,
            left: snakeLeft
        }, ...lastPositions.current]
        lastPositions.current.length = tailLength.current + 1
    }

    function setDotPosition() {
        let [randomTop, randomLeft] = getRandomPosition()
        dotTop = randomTop
        dotLeft = randomLeft
        setDotTop(() => randomTop)
        setDotLeft(() => randomLeft)
    }

    function checkDotCollision() {
        if (Math.abs(dotTop - snakeTop) === 0 && Math.abs(dotLeft - snakeLeft) === 0) {
            setDotPosition()
            tailLength.current = tailLength.current + 1
            updateScore()
        }
    }

    function checkTailCollision() {
        let tailPositions = lastPositions.current
        tailPositions = tailPositions.slice(1, tailPositions.length)
        tailPositions.forEach((pos) => {
            // console.log(pos, snakeTop, snakeLeft)
            if (Math.abs(pos.top - snakeTop) === 0 && Math.abs(pos.left - snakeLeft) === 0) {
                alert("Snake is eating itself!!")
            }
        })
    }

    async function setDirection() {
        let models = props.state.models
        let latestFrame = props.state.control
        let prediction = await predict(latestFrame, models.model, models.mobilenet)
        // console.log(prediction);
        setSnakeDirection(prediction)
    }

    function updateScore() {
        setScore((tempScore) => tempScore + 1)
    }

    function gameLoop() {
        setDirection()
        checkTailCollision()
        moveSnake()
        checkDotCollision()
    }

    useEffect(() => {
        setDotPosition()
        setInterval(() => {
            // if (props.state.play) {
            //     gameLoop()
            // }
        }, 70)
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (props.state.play) {
                gameLoop()
            }
            setRerender(!rerender)
            // console.log(props.state);
        }, 150)
    }, [rerender])

    // function spacebarPressed(e) {
    //     if (e.code === "ArrowUp" && snakeDirection !== "down") {
    //         snakeDirection = "up"
    //         setSnakeDirection(snakeDirection);
    //     } else if (e.code === "ArrowDown" && snakeDirection !== "up") {
    //         snakeDirection = "down"
    //         setSnakeDirection(snakeDirection);
    //     } else if (e.code === "ArrowLeft" && snakeDirection !== "right") {
    //         snakeDirection = "left"
    //         setSnakeDirection(snakeDirection);
    //     } else if (e.code === "ArrowRight" && snakeDirection !== "left") {
    //         snakeDirection = "right"
    //         setSnakeDirection(snakeDirection);
    //     }
    // }

    // window.addEventListener("keydown", spacebarPressed)

    // const [fakeCurrentDate, setFakeCurrentDate] = useState(new Date()) // default value can be anything you want

    // useEffect(() => {
    //     setTimeout(() => setFakeCurrentDate(new Date()), 1000)
    // }, [fakeCurrentDate])

    const grid = {
        width: containerStyle.width,
        height: containerStyle.height,
        position: "relative",
        border: "1px solid brown",
        margin: "auto",
    };
    const snakeBase = {
        width: "20px",
        height: "20px",
        backgroundColor: "red",
        backgroundSize: "20px 20px",
        position: "absolute",
    };
    const snake = {
        width: "20px",
        height: "20px",
        backgroundColor: "green",
        backgroundSize: "20px 20px",
        position: "absolute",
        top: `${snakeTop}px`,
        left: `${snakeLeft}px`
    };
    const dot = {
        width: "20px",
        height: "20px",
        backgroundColor: "blue",
        backgroundSize: "20px 20px",
        position: "absolute",
        top: `${dotTop}px`,
        left: `${dotLeft}px`
    }
    const scoreStyle = {
        display: "flex",
        justifyContent: "center"
    }

    return (
        <div>
            <h1 id="score" style={scoreStyle}>Score: {score}</h1>
            <div className="grid" id="grid" style={grid}>
                <div className="snake" id="snake" style={snake} />
                {lastPositions.current.map((pos) => {
                    return <div style={{
                        ...snakeBase,
                        top: `${pos.top}px`,
                        left: `${pos.left}px`
                    }} key={lastPositions.current.indexOf(pos)} />
                })}
                <div className="dot" id="dot" style={dot} />
            </div>
            {/* <h2>{fakeCurrentDate.toString()}</h2> */}
        </div>
    );
}

const mapStateToProps = (state) => ({
    state: state
})

export default connect(mapStateToProps)(Snake)