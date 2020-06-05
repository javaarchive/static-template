if (window.MidiParser) {
  console.log("Midi Parser Transferred Success");
} else {
  console.log("Midi Parser could not be loaded. ");
}
// Configuration
let config = {
  keyStart: 21,
  keyEnd: 110,
  whiteKeyWidth: 20,
  blackKeyWidth: 10,
  whiteKeyHeight: 100,
  blackKeyHeight: 60,
  pianoTop: 0,
  pianoHeight: 80,
  pianoBottom: 0,
  offsetkeys: 2,
  offsetX: 100,
  visualMultiply: 1,
  maxRange: 257 // Max range of midi notes
};
console.log("Welcome to BrowserMidi");
window.onload = function() {
  $("#loading-overlay").text("Loaded");
  setTimeout(function() {
    $("#loading-overlay").remove();
  }, 1000);
};
var height,
  width,
  mode = "menu",
  canvas,
  ctx,
  grd;
function setMode(newmode) {
  mode = newmode;
  if (mode === "menu") {
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }
}
$(function() {
  canvas = document.getElementById("screen");
  ctx = canvas.getContext("2d");
  canvas.height = $(window).height();
  canvas.width = $(window).width();
  grd = ctx.createLinearGradient(0, 0, 0, 200);
  grd.addColorStop(0, "cyan");
  grd.addColorStop(1, "lightblue");
  height = $(window).height();
  width = $(window).width();
  config.pianoTop = height - config.pianoHeight;
  config.pianoBottom = height;
  config.halfBlackKeyWidth = config.blackKeyWidth / 2;
  generatePiano();
  setMode("menu");
  draw();
  loadMidi();
});
const modnumtokeydist = {
  0: 0,
  2: 1,
  4: 2,
  5: 3,
  7: 4,
  9: 5,
  11: 6
};
function calculateKeyPos(curKey) {
  curKey = curKey + config.offsetkeys;
  let output = { topY: config.pianoTop };
  let relpos = curKey - config.keyStart;
  var startPos;
  let modnum = curKey % 12;
  switch (modnum) {
    case 1:
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      console.log(startPos);
      output.topX =
        startPos * config.whiteKeyWidth +
        config.whiteKeyWidth -
        config.halfBlackKeyWidth;
      output.keyHeight = config.blackKeyHeight;
      output.keyWidth = config.blackKeyWidth;
      output.keytype = "black";
      break;
    case 3:
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      console.log(startPos);
      output.topX =
        startPos * config.whiteKeyWidth +
        config.whiteKeyWidth * 2 -
        config.halfBlackKeyWidth;
      output.keyHeight = config.blackKeyHeight;
      output.keyWidth = config.blackKeyWidth;
      output.keytype = "black";
      break;
    case 6:
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      console.log(startPos);
      output.topX =
        startPos * config.whiteKeyWidth +
        config.whiteKeyWidth * 4 -
        config.halfBlackKeyWidth;
      output.keyHeight = config.blackKeyHeight;
      output.keyWidth = config.blackKeyWidth;
      output.keytype = "black";
      break;
    case 8:
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      console.log(startPos);
      output.topX =
        startPos * config.whiteKeyWidth +
        config.whiteKeyWidth * 5 -
        config.halfBlackKeyWidth;
      output.keyHeight = config.blackKeyHeight;
      output.keyWidth = config.blackKeyWidth;
      output.keytype = "black";
      break;
    case 10:
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      console.log(startPos);
      output.topX =
        startPos * config.whiteKeyWidth +
        config.whiteKeyWidth * 6 -
        config.halfBlackKeyWidth;
      output.keyHeight = config.blackKeyHeight;
      output.keyWidth = config.blackKeyWidth;
      output.keytype = "black";
      break;
    case 0:
    default:
      //console.log("Mod num " + modnum);
      startPos = Math.floor(curKey / 12) * 7 + config.offsetkeys;
      output.topX =
        startPos * config.whiteKeyWidth +
        modnumtokeydist[modnum] * config.whiteKeyWidth;
      output.keyHeight = config.whiteKeyHeight;
      output.keyWidth = config.whiteKeyWidth;
      output.keytype = "white";
      break;
  }
  output.topX =
    output.topX - config.keyStart * config.whiteKeyWidth + config.offsetX;
  return output;
}
let whiteKeys = [];
let blackKeys = [];
function generatePiano() {
  console.log("Generating Piano");
  whiteKeys = [];
  blackKeys = [];
  let start = 0;
  let end = config.keyEnd - config.keyStart;
  let curKey = config.keyStart;
  for (let i = start; i <= end; i++) {
    curKey++;
    let shape = calculateKeyPos(curKey);
    if (shape.keytype === "white") {
      whiteKeys.push(shape);
    } else if (shape.keytype === "black") {
      blackKeys.push(shape);
    }
  }
}
generatePiano();
var loaded_notes = [];
var state = [];
var time = 0;
var lastDrawTime = 0;
var timeelapsed = 0;
var ppq = 480;
function drawNotes() {
  let curTime = performance.now();
  timeelapsed += curTime - lastDrawTime;
  lastDrawTime = curTime;
  let curticks = (ppq * timeelapsed) / 1000;
}
function prcoessMidi(midi) {
  ppq = midi.timeDivison;
  function noteOn(time, num, velocity) {
    if (state[num] == -1) {
      state[num] = time;
    }
  }
  function noteOff(time, num, velocity) {
    if (state[num] != -1) {
      loaded_notes.push({
        startTime: state[num],
        endTime: time,
        velocity: velocity,
        num: num
      });
      state[num] = -1;
    }
  }
  for (let tracknum = 0; tracknum < midi.tracks; tracknum++) {
    state = [];
    for (let i = 0; i < config.maxRange; i++) {
      state.push(-1);
    }
    for (let i = 0; i < midi.track[tracknum].event.length; i++) {
      let midievent = midi.track[tracknum].event[i];
      //console.log(midievent);
      if (midievent.data && midievent.data.length == 2) {
        if (midievent.data[1] == 0) {
          noteOff(midievent.deltaTime, midievent.data[0], midievent.data[1]);
        } else {
          noteOn(midievent.deltaTime, midievent.data[0], midievent.data[1]);
        }
      }
    }
  }
  loaded_notes.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
}
function playMidi(midi) {
  setMode("playing");
  lastDrawTime = performance.now();
  drawNotes();
}
function drawpiano() {
  console.log("Drawing Piano");
  for (let i = 0; i < whiteKeys.length; i++) {
    ctx.beginPath();
    let { topX, topY, keyWidth, keyHeight, keytype } = whiteKeys[i];
    //ctx.globalCompositeOperation = composite;
    /*ctx.rect(
        i * config.whiteKeyWidth,
        config.pianoTop,
        (i + 1) * config.whiteKeyWidth,
        config.pianoBottom
      );*/
    ctx.rect(topX, topY, keyWidth, keyHeight);
    //console.log("Current Index: " + i);
    console.log(topX, topY, keyWidth, keyHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
  }
  for (let i = 0; i < blackKeys.length; i++) {
    ctx.beginPath();
    let { topX, topY, keyWidth, keyHeight, keytype } = blackKeys[i];
    //ctx.globalCompositeOperation = composite;
    /*ctx.rect(
        i * config.whiteKeyWidth,
        config.pianoTop,
        (i + 1) * config.whiteKeyWidth,
        config.pianoBottom
      );*/
    ctx.rect(topX, topY, keyWidth, keyHeight);
    //console.log("Current Index: " + i);
    console.log(topX, topY, keyWidth, keyHeight);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
  }
}

function draw() {
  drawpiano();
  if (mode === "midi") {
  }
}
function loadMidi() {
  loaded_notes = [];
  console.log("Started Midi Loading");
  let source = document.getElementById("fileinput");
  // provide the File source and a callback function
  MidiParser.parse(source, function(obj) {
    console.log(obj);
    prcoessMidi(obj);
    playMidi(obj);
  });

  /*source.files[0].arrayBuffer().then(function(ab) {
    MidiParser.parse(ab, function(obj) {
      console.log(obj);
    });
  });*/
}
