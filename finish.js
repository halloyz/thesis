let result = window.localStorage.getItem("result");
result = JSON.parse(result);
function download(content, filename){
    const a = document.createElement('a') // Create "a" element
    const blob = new Blob([JSON.stringify(content)], {type: 'application/json'}) // Create a blob (file-like object)
    const url = URL.createObjectURL(blob) // Create an object URL from blob
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', filename) // Set download filename
    a.click() // Start downloading
  }

document.getElementById("download").onclick = function(){
    fname = JSON.stringify(result.email)
    download(result, fname)
    localStorage.clear()
    
}
document.getElementById("survey").onclick = function(){
  window.location = "https://docs.google.com/forms/d/e/1FAIpQLSevUNB3lHH2yzvmZ8pxuGN0RSWhdykNlwPaWQTytGdq8ggh6A/viewform?usp=sf_link";
  
}
