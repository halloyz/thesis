let startTime = 0
let endTime = 0
let result = window.localStorage.getItem(("result"));
result = JSON.parse(result)



document.getElementById("start").onclick = function() {
  startTime = performance.now();
  window.location.href = "../main_complex.html";

}

document.getElementById("stop").onclick = function(){
    let time = Math.floor((performance.now() - startTime)/1000)
    result.task1 = time
    document.getElementById("message").innerHTML = "Timer stopped!"
    document.getElementById("next").style.visibility = "visible";
}
document.getElementById("next").onclick = function(){
    console.log(result)
    window.localStorage.setItem("result", JSON.stringify(result));
    window.location.href = "finish.html";

}