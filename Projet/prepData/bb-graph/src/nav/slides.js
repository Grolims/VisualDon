//** DEBUGGING */
console.log("./nav/slides.js : Linked")

/** JQUERY */
const $ = require('jquery');

/** GLOBAL VARS */
var slideIndex = 1;

// Slide change handler
var changeSlide = n => {
    slideIndex += parseInt(n);
    showSlide();
}

// Keyboard navigation
$(window).on("keydown", evt => {
    let prevKeys = ["a", "Left", "ArrowLeft"];
    let nextKeys = ["d", "Right", "ArrowRight"];
    let keypress = evt.key;

    if (prevKeys.includes(keypress)) changeSlide("-1");
    if (nextKeys.includes(keypress)) changeSlide("1");
})

// Mouse navigation
$("#slide-nav").on("click", evt => {
    let btn = evt.target;
    let slideValue = parseInt(btn.dataset.click);
    
    changeSlide(slideValue);
})

// Displays current index slide - exported for DOM update
export function showSlide() {
    let slides = $(".slide");
    slides.addClass("hidden");
    $(".slide-nav").removeClass("hidden");

    if (slideIndex == 0) slideIndex = 1;
    if (slideIndex > slides.length) slideIndex = slides.length;

    $(`.pos-${slideIndex}`).removeClass("hidden");

    if (slideIndex === 1) $("#prev").addClass("hidden");
    if (slideIndex == slides.length) $("#next").addClass("hidden");
}