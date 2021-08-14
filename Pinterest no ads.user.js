// ==UserScript==
// @name         Pinterest no ads
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  remove promoted pins
// @author       Darmikon
// @include     https://www.pinterest.ca/*
// @include     https://www.pinterest.com/*
// @grant        none
// ==/UserScript==



const trimAds = () => {
    const ads = document.querySelectorAll("[data-test-id*='oneTapPromotedPin']");
    ads.forEach(feed => {
       feed.parentNode.style.display = "none";
    });
}

(function() {
    setTimeout(trimAds, 500);

    window.addEventListener('scroll', () => {
        setTimeout(trimAds, 500);
    });
})();

