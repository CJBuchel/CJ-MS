import MHubClient from "mhub/dist/src/browserclient";
var client = new MHubClient("ws://localhost:13900");
// 
// ----------------- On Change Events ---------------------
// 
const RETRY_TIMEOUT = 1000; // 1 second
const listeners = {};
let connectPromise = null;
function connect() {
    if (!connectPromise) {
        connectPromise = Promise.resolve(client.connect())
            .then(() => {
            console.log('Connected to mhub');
            Object.keys(listeners).map(topic => client.subscribe('protected', topic));
        })
            .catch(err => {
            console.error(`Error while logging into mhub: ${err.message}`);
            throw err;
        });
    }
    return connectPromise;
}
function attemptReconection() {
    connectPromise = null;
    console.log('Disonnected from mhub');
    setTimeout(() => {
        console.log('Retrying mhub connection');
        connectPromise = null;
        connect()
            .catch(() => {
            attemptReconection();
        });
    }, RETRY_TIMEOUT);
}
client.on('close', () => {
    attemptReconection();
});
client.on('message', message => {
    const topic = message.topic;
    listeners[topic].forEach(listener => listener(message.data));
});
function removeClockListener(event, listener) {
    const topic = `clock:${event}`;
    const index = listeners[topic].indexOf(listener);
    listeners[topic].splice(index, 1);
}
function onClockEvent(event, listener) {
    const topic = `clock:${event}`;
    listeners[topic] = listeners[topic] || [];
    return connect()
        .then(() => client.subscribe('cj_node', topic))
        .then(() => { listeners[topic].push(listener); })
        .then(() => removeClockListener.bind(null, event, listener));
}
export const onClockEndEvent = onClockEvent.bind(null, 'end');
export const onClockStopEvent = onClockEvent.bind(null, 'stop');
export const onClockTimeEvent = onClockEvent.bind(null, 'time');
export const onClockPrestartEvent = onClockEvent.bind(null, 'prestart');
export const onClockStartEvent = onClockEvent.bind(null, 'start');
export const onClockReloadEvent = onClockEvent.bind(null, 'reload');
export const onClockEndGameEvent = onClockEvent.bind(null, 'endgame');
// 
// ----------------- Sender Event ---------------------
// 
let loginPromise = null;
function login() {
    if (!loginPromise) {
        loginPromise = Promise.resolve(client.connect())
            .then(() => client.login("cj_fss", "fss"));
    }
    return loginPromise;
}
// Main send event
function sendEvent(node, topic, e) {
    return login().then(() => client.publish(node, topic, e));
}
// Main senders for Time
function sendClockTimeEvent() {
    return sendEvent("cj_node", "clock:time", "test");
}
function sendClockStartEvent(e) {
    return sendEvent("cj_node", "clock:start", e);
}
function sendClockStopEvent(e) {
    return sendEvent("cj_node", "clock:stop", e);
}
function sendClockEndgameEvent(e) {
    return sendEvent("cj_node", "clock:endgame", e);
}
function sendClockEndEvent(e) {
    return sendEvent("cj_node", "clock:end", e);
}
function sendClockPrestartEvent(e) {
    return sendEvent("cj_node", "clock:prestart", e);
}
function sendClockReload(e) {
    return sendEvent("cj_node", "clock:reload", e);
}
module.exports = sendEvent;
// export {sendEvent};
