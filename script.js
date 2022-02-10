//helpers

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    shuffle: shuffle
};


if (!("serial" in navigator)) {
    // The Web Serial API is not supported.
    alert("Your browser does not support Web Serial, try using something Chromium based.")
}

//Love's code

const requestPortButton = document.querySelector("#request-port-access");
requestPortButton.addEventListener("pointerdown", async(event) => {
    // First, request port access, which hopefully leads to a connection
    const port = await navigator.serial.requestPort();
    state.serial = port;
    document.querySelector("#connection-status").innerHTML = "Arduino is connected!";

    // Then, open communications to is with the correct baudRate. This _has_ to be the same in both the Arduino sketch and on the website!
    await state.serial.open({ baudRate: 9600 });

    // Next, we need to open a "writer", a stream that we can pour data into.
    console.log("Connected to Arduino and updated state:")
    console.log(state);
    readJSONFromArduino("joystick", updateDataDisplay);
});


// This function will read data from the Arduino
const readJSONFromArduino = async(propertyName, callback) => {
    if (!state.serial) throw new Error("No Arduino connected to read the data from!");

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = state.serial.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    let lineBuffer = "";

    // Listen to data coming from the serial device.
    while (true) {
        const response = await reader.read();

        if (response.done) {
            reader.releaseLock();
            break;
        }

        lineBuffer += response.value;
        const lines = lineBuffer.split("\n");
        if (lines.length > 1) {
            lineBuffer = lines.pop();
            const line = lines.pop().trim();
            const json = JSON.parse(line);
            state[propertyName] = json;
            callback(json);
        }
        console.dir(state)
    }
}


const updateDataDisplay = () => {
    document.querySelector("#joystick-x").innerHTML = state.joystick.x;
    document.querySelector("#joystick-y").innerHTML = state.joystick.y;
    document.querySelector("#joystick-pressed").innerHTML = state.joystick.pressed;
}


// This is the same as the Arduino function `map`, a name that is already occupied in JS by something completely different (would you have guessed)
const mapRange = (value, fromLow, fromHigh, toLow, toHigh) => {
    return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}


const state = {
    serial: null,
    joystick: {
        x: 0,
        y: 0,
        pressed: false,
    }
}

//Facts

let ourFact = useless_facts[0]

if (state.joystick.pressed) {
    let x = 0;
    x++;
    ourFact = useless_facts[x];
}