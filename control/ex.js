//https://kahlillechelt.com/how-to-communicate-between-two-electron-windows-166fdbcdc469
var canvas = document.getElementById('hourg');
var myBtn = document.getElementById('inc');
var ptsToAdd = document.getElementById('num');
var ctx = canvas.getContext('2d');

function fill(percent){
	percent = percent / 10;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = "#F00";
  ctx.moveTo(0, 150);
  ctx.lineTo(0, 150-percent);
  ctx.lineTo(300, 150-percent);
  ctx.lineTo(300, 150);
  ctx.fill();
  if(percent!=0){
    ctx.moveTo(0, 150-percent);
    ctx.lineTo(150, 150-percent-5);
    ctx.lineTo(300, 150-percent);
    ctx.fill();
  }
}
fill(0)
var current = 0;
function addPoints(total, added){
	var ptsTmp = total-added;
  var inc = added > 0 ? 1 : -1;
	var augmenter = setInterval(function(){ 
    if(ptsTmp != total){
      fill(ptsTmp); 
      ptsTmp += inc;
    } else {
    	clearInterval(augmenter);
    }
  }, 30);
}

var incPoints = function(){
	var toAdd = Number(ptsToAdd.value);
  ptsToAdd.value = 0;
  current += toAdd;
	console.log(current);
  //fill(current);
	addPoints(current, toAdd);
}
myBtn.onclick = incPoints;