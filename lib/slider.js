const sliderEl = document.querySelector("#slider-input")

const selectedEl = document.querySelector(".selected")

sliderEl.addEventListener("input", () => {
    selectedEl.innerHTML = sliderEl.value;
});

function send(){
    var aa = selectedEl;
    window.location.href="reviewfield.php?data="+aa;
}

send()