var myPopup; //Setting as a global variable so we don't have to worry about passing the object around

//Simple implementation
function basicClick() {
    myPopup.showPopup("<h2>Showing Popup</h2><p>It will disappear after 2.5 seconds</p>");
    
    //Just to demonstrate what the popup looks like, we'll set a short timer and we'll hide the popup after the timer finishes.
    var timer = setTimeout(function(){
        myPopup.hidePopup();

    }, 2500);
}


//Let's try some template strings
function templateStrings() {
    
    /*Because we're using setContent here and myPopup is a global object, 
    if we've clicked another button that set a callback or enabled the close button, 
    those will be active when this popup is shown.
    If we don't want this behavior, we could simply re-initialize myPopup: myPopup = new PanelPopup().*/
    myPopup.setContent("<h2>Showing Popup</h2><p>It will disappear after {delay} {unit length}. {This template} won't be replaced</p>")
    //{This template} won't be replaced because we're not passing it as a key in the templateKeys object. 
    //The popup will ignore template strings it can't find a key for.
    
    var delay = 3000; //Delay before the popup disappears in milliseconds. Adjust this value to see how the template strings change.
    
    var delayDisplay = delay/1000
    
    var unit = "seconds"
    if (delayDisplay==1.0) { //If it's a 1 second delay, use the singular instead of the plural
        unit = "second"
    }

    myPopup.showPopup({
        templateKeys:{
            delay:delayDisplay,
            "unit length":unit //Template key more than one word long
        }
    });
    
    
    var timer = setTimeout(function(){
        myPopup.hidePopup();

    }, 2500);
}

//Demonstrate how to add a close button and change its caption
function closeButton() {
    myPopup.showPopup("<h2>I have a close button</h2><p>Click the button to close me</p>",{
        closeButton: true,
        closeCaption: "Click me!"
    });
}

//Just a helper function to call the extendscript that blocks the UI
function callExtendScript() {
    var csInterface = new CSInterface();

    //The argument here is milliseconds for the extendscript to block the UI
    csInterface.evalScript("$._PanelPopupSample_.longCall(5000)", extendScriptDone);
}

//This will fail because the UI will freeze before the popup can be drawn.
function longCallFail() {
    
    myPopup.showPopup("<h2>I probably won't appear</h2><p>The UI froze before I had a chance to get drawn</p>",{
        closeButton: true,
        closeCaption: "Just in case I get stuck"
    });

    callExtendScript();
}

//This works! We're going to call the extendscript after a short delay
function longCallGood() {
    myPopup.showPopup("<h2>I will appear</h2><p>Thanks to a delay, I got drawn before the extendscript was called.</p>",{
        closeButton: true,
        closeCaption: "Just in case I get stuck"
    });

    var aDelay = setTimeout(callExtendScript,100); //In my tests, you need at least 50ms, I use 100 to be safe.

}

//This executes after the extendscript finishes. It just hides the popup
//Note that this only works because myPopup is global. If it were a local variable, this function wouldn't know what to do
//The callbackOverwrite function a little further down shows how you could make this work with a local variable
function extendScriptDone() {
    myPopup.hidePopup();
}

//Callback function
function popupCloseCallback() {
    alert("Got to the primary callback!");
}

//Alternate callback function
function alternateCallback() {
    alert("Got to the alternate callback!");
}


//This won't work
//The popup will show and the callback will fire if you press the close button, 
//but setTimeout messes with the popups scope and can't close it
function callbackFail1() {
    myPopup.showPopup("<h2>This will fail</h2><p>You'll need to close me manually", {
        closeButton: true,
        closeCaption: "Close",
        callback: popupCloseCallback
    });

    //'this' is set to the global context with setTimeout, therefore the somePanel object can't find itself and this won't work
    var someDelay = setTimeout(myPopup.hidePopup,100);
}

//We're looking at a few things here. 
//First, we see that by giving hidePopup a callback argument, we overwrite the callback specified when we call showPopup
//Second, by nesting anonymous functions, the localPopup variable stays in scope and we don't need to define it as a global variable.
//  While global variables are generally frowned upon, IMHO, double nesting callback functions like this is ugly and hard to follow,
//  so I suggest defining the popup globally for the sake of readability
function callbackOverwrite() {
    var localPopup = new PanelPopup("<h2>Alternate Callback</h2><p>We reach the alt. callback because we set it in hidePopup.");
    localPopup.showPopup({
        closeButton: true,
        closeCaption: "Close",
        callback: popupCloseCallback
    });

    var csInterface = new CSInterface();
    var aDelay = setTimeout(function() {
        var csInterface = new CSInterface();
        csInterface.evalScript("$._PanelPopupSample_.longCall(1000)", function(){
            localPopup.hidePopup(alternateCallback);
        });
    },100);

}

function screenshot() {
    var screenshotPopup = new PanelPopup();
    screenshotPopup.showPopup("<h2>Panel Popup</h2><p>A simple javascript library to generate and manage a \"please wait\" modal overlay layer for Adobe CEP panels.</p>",{
        closeButton: true
    });
}

//The code here really isn't important, the thing to note is that you can override the default styles with your own stylesheet
function toggleStyle() {

    var customStylesheet = document.getElementById('custom-styles').sheet;
    var styleButton = document.getElementById('styles')
    var styleState = ""

    if (customStylesheet.disabled) {
        customStylesheet.disabled = false;
        styleButton.innerHTML = "Turn off the custom styles";
        styleState = "enabled";
    } else {
        customStylesheet.disabled = true;
        styleButton.innerHTML = "Turn on the custom styles";
        styleState = "disabled";
    }

    var stylePopup = new PanelPopup();
    stylePopup.showPopup("<h2>Custom Styles have been {state}</h2><p>You can override the default styles with your own css stylesheet.</p>",
    {
        closeButton: true,
        templateKeys: {
            state: styleState
        }
    });   
}


function bodyLoaded(){
    myPopup = new PanelPopup();

    document.getElementById('basic-demo').addEventListener('click',basicClick);
    document.getElementById('template-strings').addEventListener('click',templateStrings);
    document.getElementById('close-button').addEventListener('click',closeButton);
    document.getElementById('long-call-fail').addEventListener('click',longCallFail);
    document.getElementById('long-call-good').addEventListener('click',longCallGood);
    document.getElementById('callback-fail-1').addEventListener('click',callbackFail1);
    document.getElementById('callback-overwrite').addEventListener('click',callbackOverwrite);
    document.getElementById('screenshot').addEventListener('click',screenshot);
    document.getElementById('styles').addEventListener('click',toggleStyle);

    var customStylesheet = document.getElementById('custom-styles').sheet;
    customStylesheet.disabled = true;
    


    


}






