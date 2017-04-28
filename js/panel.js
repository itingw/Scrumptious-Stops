//activates the tab to make it highlighted
document.getElementById("defaultOpen").click();

//how to make tabs: https://www.w3schools.com/howto/howto_js_tabs.asp

function openTab(evt, tab) {
    //variables
    var i, tabcontent, tablinks;

    //display divs that have the class "tabcontent"
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // remove the class "active" from all divs with the class "tablinks"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // activate the div that has been clicked, hide the others
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
}


//make filter buttons show as active
function activate(evt, className) {

    // remove the class "active" from all buttons with the class "filter"
    filterButtons = document.getElementsByClassName(className);
    for (i = 0; i < filterButtons.length; i++) {
        filterButtons[i].className = filterButtons[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
}

//open panel in mobile/small screens
var menu = document.querySelector('#menu');
var drawer = document.querySelector('.options-box');

menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
});
