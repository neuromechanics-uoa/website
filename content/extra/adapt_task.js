const target_radius = 30;
const inset = 40;
const turn_refractory = 10;

window.addEventListener('load', ()=>{
    resize(); // Resizes the canvas once the window loads
    document.addEventListener('mousedown', startPainting);
    document.addEventListener('mouseup', stopPainting);
    document.addEventListener('mousemove', sketch);
    window.addEventListener('resize', resize);
    var save_btn = document.getElementById('save');
    save_btn.addEventListener('click', saveData, false);
    var one_btn = document.getElementById('one');
    one_btn.addEventListener('click', setScale0, false);
    var two_btn = document.getElementById('two');
    two_btn.addEventListener('click', setScale1, false);
    var three_btn = document.getElementById('three');
    three_btn.addEventListener('click', setScale0, false);
    init_canvas(); // Draws the target circles
});

const canvas = document.querySelector('#canvas');

// Context for the canvas for 2 dimensional operations
const ctx = canvas.getContext('2d');

// Resizes the canvas to the available size of the window.
function resize(){
  ctx.canvas.width = window.innerWidth - 50;
  ctx.canvas.height = window.innerHeight;
}

function init_canvas(){
  // clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // draw left circle
  let centerX = inset;
  let centerY = ctx.canvas.height / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, target_radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#003300';
  ctx.stroke();

  // draw the right circle
  ctx.beginPath()
  centerX = ctx.canvas.width - inset;
  centerY = ctx.canvas.height / 2;
  ctx.arc(centerX, centerY, target_radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#003300';
  ctx.stroke();
}

// Stores the initial position of the cursor
let coord = {x:0, y:0};
let pen = {x:0, y:0};
let prev = {x:0, y:0};

// This is the flag that we are going to use to
// trigger drawing
let paint = false;

var xdata  = [];
var ydata  = [];

var max_dev     = [];
var accuracy    = [];
var path_length = [];

var i = 0;
var last_turn_i    = 0;
var last_turn_left = false;

var scale = 0;

function init_vars() {
  xdata = [];
  ydata = [];
  max_dev = [];
  accuracy = [];
  path_length = [];
  i = 0;
  last_turn_i = 0;
  last_turn_left = false;
}

function setScale0() {
  scale = 0;
  init_vars();
  init_canvas();
}

function setScale1() {
  scale = 1;
  init_vars();
  init_canvas();
}

// Updates the coordianates of the cursor when
// an event e is triggered to the coordinates where
// the said event is triggered.
function getPosition(event){
  prev.x = coord.x;
  prev.y = coord.y;
  coord.x = event.offsetX;
  coord.y = event.offsetY;
}

// The following functions toggle the flag to start
// and stop drawing
function startPainting(event){
  canvas.style.cursor = 'none';
  paint = true;
  getPosition(event);
  pen.y = coord.y;
}
function stopPainting(){
  paint = false;
  canvas.style.cursor = 'default';
}

function sketch(event){
  if (!paint) return;
  ctx.beginPath();

  // Sets the end of the lines drawn
  // to a round shape.
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;

  // The cursor to start drawing
  // moves to this coordinate
  ctx.moveTo(coord.x, pen.y);

  // The position of the cursor
  // gets updated as we move the
  // mouse around.
  getPosition(event);

  // A line is traced from start
  // coordinate to this coordinate
  let vx = coord.x - prev.x
  pen.y += coord.y - prev.y + vx * scale * 0.5;
  ctx.lineTo(coord.x, pen.y);
  xdata.push(coord.x);
  ydata.push(pen.y);
  i++;

  // Draws the line.
  ctx.stroke();

  if (is_turn_pt()) {
    // handle end of a sweep

    // draw the right circle
    ctx.beginPath()
    centerX = xdata[xdata.length - 2];
    centerY = ydata[ydata.length - 2];
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI, false);
    if (curr_left) {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'blue';
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#330000';
    ctx.stroke();

    // calculate stats for that sweep
    xtrial = xdata.slice(last_turn_i, xdata.length - 1)
    ytrial = ydata.slice(last_turn_i, ydata.length - 1)
    max_dev.push(get_max_dev(xtrial, ytrial));
    accuracy.push(get_accuracy(xtrial, ytrial));
    path_length.push(get_path_length(xtrial, ytrial));

    last_turn_i = i;
    last_turn_left = (coord.x < ctx.canvas.width / 2);
  }
}

function is_turn_pt() {
  curr_left = coord.x < (ctx.canvas.width / 2);
  if ((i > 2) & ((i - last_turn_i) > turn_refractory) &
      (curr_left != last_turn_left)) {
    diff1 = xdata[xdata.length - 3] - xdata[xdata.length - 2];
    diff0 = xdata[xdata.length - 2] - xdata[xdata.length - 1];
    return (diff0 > 0) != (diff1 > 0);
  }
  else {
    return false;
  }
}

function absmax(arr) {
  let mx = Math.max(...arr);
  let mn = Math.abs(Math.min(...arr));
  if (mn > mx) {
    return mn
  } else {
    return mx
  }
}

function get_max_dev(xtrial, ytrial) {
  let dist = [];
  for (let j = 0; j < xtrial.length; j++) {
    dist.push(ytrial[j] - ctx.canvas.height / 2);
  }
  return absmax(dist)
}

function get_accuracy(xtrial, ytrial) {
  let pt = {x:xtrial[xtrial.length - 1], y:ytrial[ytrial.length - 1]};
  let targ;
  if (pt.x < ctx.canvas.width / 2) {
    targ = {x:inset, y:ctx.canvas.height / 2};
  } else {
    targ = {x:ctx.canvas.width - inset, y:ctx.canvas.height / 2};
  }
  return ((pt.x - targ.x)**2 + (pt.y - targ.y)**2)**(0.5);
}

function get_path_length(xtrial, ytrial) {
  let dist = 0;
  for (let j = 0; j < xtrial.length - 1; j++) {
    dx2 = (xtrial[j + 1] - xtrial[j])**2;
    dy2 = (ytrial[j + 1] - ytrial[j])**2;
    dist += (dx2 + dy2)**(0.5);
  }
  return dist;
}

// create server-side file and offer to save to local fs
var textFile = null;

function makeTextFile(text){
  var data = new Blob([text], {type: 'text/plain'});

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);

  // returns a URL you can use as a href
  return textFile;
};

function saveData(){
  var link = document.createElement('a');
  link.setAttribute('download', 'data.csv');

  data = 'Max Deviation,Accuracy,Path Length\n';
  for (let j = 0; j < max_dev.length; j++) {
    data += max_dev[j] + ',' + accuracy[j]
        + ',' + path_length[j] + '\n';
  }
  link.href = makeTextFile(data);
  document.body.appendChild(link);

  // wait for the link to be added to the document
  window.requestAnimationFrame(function () {
    var event = new MouseEvent('click');
    link.dispatchEvent(event);
    document.body.removeChild(link);
  });
}
