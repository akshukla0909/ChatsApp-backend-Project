
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

//profile menu handle 

let prof = document.querySelector("#prof-icon")
let profMenu = document.querySelector(".prof-menu")
let profMenu2 = document.querySelector("#prof-menu2")
let profile = document.querySelector(".profile123")

let menuOpen = false; 

prof.addEventListener("click", function(){
//console.log("nice")
menuOpen = true;
if(menuOpen){
   console.log(menuOpen)
    profMenu.classList.add('open')
}
})


profMenu2.addEventListener("click", function () {
if (menuOpen) {
    profMenu.classList.remove('open');
    menuOpen = false;
}
});

// profile.addEventListener("click", function () {
// menuOpen = true;
// if (menuOpen) {
//     profMenu.classList.add('open');
// }
// });

// image change js camera
document.querySelector(".camera")
.addEventListener("click", function(){
document.querySelector("#img-form").click();

})

document.querySelector("#img-form")
.addEventListener("change", function(){
document.querySelector("#img-form-s").submit();
})

// create group js
// let group = document.querySelector("#group-icon")

// group.addEventListener('click', ()=>{
   // console.log('nice');
// })

