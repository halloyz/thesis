let result = {email: null, task1: null}

document.getElementById("proceed").onclick = function(){
    result.email = document.getElementById("email").value
    console.log(result)
    if (!result.email){
      alert("Please enter your e-mail")
    }
    else{
    window.localStorage.setItem("result", JSON.stringify(result));
    window.location.href = "task1/task1.html";
    }
}