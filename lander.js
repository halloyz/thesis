function getRandomKey(obj) {
  const keys = Object.keys(obj);

  //return obj[keys[ keys.length * Math.random() << 0]];
  return keys[Math.floor(Math.random() * keys.length)];
}

// Upon clicking the link, the user will be randomly given a number 1-6, corresponding to which route will be given to them for each task.
//const cases = window.cases;
const usercase = getRandomKey(cases);

let result = {case: usercase, email: null, task1: {completed: false, failed: false}, task2: {completed: false, failed: false}, task3: {completed: false, failed: false}}

document.getElementById("proceed").onclick = function(){
    result.email = document.getElementById("email").value
    console.log(result)
    if (!result.email){
      alert("Please enter your first and last name together, in the following format: 'FirstnameLastname'");
    }
    else{
    window.localStorage.setItem("result", JSON.stringify(result));
    window.location.href = "task1/instructions.html";
    }
}