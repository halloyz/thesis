let startTime = 0
let endTime = 0
let result = {name: null, completion_time: null}


function download(content, filename){
  const a = document.createElement('a') // Create "a" element
  const blob = new Blob([JSON.stringify(content)], {type: 'application/json'}) // Create a blob (file-like object)
  const url = URL.createObjectURL(blob) // Create an object URL from blob
  a.setAttribute('href', url) // Set "a" element link
  a.setAttribute('download', filename) // Set download filename
  a.click() // Start downloading
}
document.getElementById("result").style.visibility = "hidden";

document.getElementById("start").onclick = function() {
  startTime = performance.now();
  document.getElementById("message").style.visibility = "visible";

}

document.getElementById("stop").onclick = function(){
    result.completion_time = (performance.now() - startTime)/1000
    document.getElementById("message").innerHTML = "Timer stopped!"
    document.getElementById("result").style.visibility = "visible";
    result.name = document.getElementById("name").value

}
document.getElementById("result").onclick = function(){
    result.name = document.getElementById("name").value
    if (!result.name){
      alert("Please enter your e-mail")
    }
    else{
      
    download(result, 'Result.json')
    }
}