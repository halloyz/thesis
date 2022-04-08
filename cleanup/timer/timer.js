let startTime = 0
let endTime = 0
let result;

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
document.getElementById("result").style.visibility = "hidden";

document.getElementById("start").onclick = function() {
startTime = performance.now();
console.log("Timer started!");

}

document.getElementById("stop").onclick = function(){
    endTime = (performance.now() - startTime)/1000
    console.log("Time Elapsed:")
    console.log(endTime)
    document.getElementById("result").style.visibility = "visible";

}
document.getElementById("result").onclick = function(){
    
}