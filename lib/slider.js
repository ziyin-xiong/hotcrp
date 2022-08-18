const sliderEl = document.querySelector("#slider-input")

const selectedEl = document.querySelector(".selected")

sliderEl.addEventListener("input", () => {
    selectedEl.innerHTML = sliderEl.value;
});