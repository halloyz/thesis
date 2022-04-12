let startTime = 0
let endTime = 0
let result = window.localStorage.getItem(("result"));
result = JSON.parse(result)



document.getElementById("start").onclick = function() {
  startTime = performance.now();
  window.location.href = "main_complex_1_1.html";
}
