/**
 * @fileOverview Library to generate and manage a "please wait" modal overlay layer. While not exclusively useful for Adobe CEP panels, they are what this library is designed for.
 * @author David Heidelberger <david.heidelberger@gmail.com>
 * @version 1.0.0
 */

 /* Released under an MIT License
 Copyright 2018, David Heidelberger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Options object that can be passed to set advanced features of the overlay including template strings. All of the properties are optional. Once these properties are set, they're set for the life of the PanelPopup, meaning, if you call showPopup more than once, it will remember the settings from the first call when you make the second call. You can re-initialize the PanelPopup to reset the options.
 * @typedef {Object} options
 * @property {object} [templateKeys] - Object with key/value pairs to replace template strings in the overlay's contents. The keys should match the template strings. Note that the overlay will only replace the keys that it finds in this object. So if there's a template string in your contents and you don't include a replacement for it in the templateKeys object, it won't get replaced.
 * @property {boolean} [closeButton] - If you want to include a close button, set this to true.
 * @property {string} [closeCaption=Close] - The caption you want to appear on the close button. Defaults to "Close"
 * @property {function} [callback] - Callback for when the overlay has been hidden. Can also be set when calling the hidePopup method.
 */


const defaultContent = "<h2>Working</h2><p>This may take a while for large projects</p>";


function panelPopupUniqueID() {
    //Source: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};



/**
 * The PanelPopup object creates and manages an overlay popup. 
 * @constructor
 * @param {string} [content] - The text content of the overlay. Should be HTML formatted. You can also include basic template strings by enclosing text in {}.
 */
function PanelPopup(content) {
    this.showing = false;
    this.id = panelPopupUniqueID();
    this.rawContent = content || defaultContent;
    this.templateNames = {};
    this.callback = undefined;
    this.closeButton = false
    this.closeCaption = 'Close';
   

    /**
     * Method to change the contents of the overlay after its been initialized but before it's been displayed. Probably not something you'll use very often, if ever, but there if you need it. 
     * @param {string} content - The new overlay contents. Should be HTML formatted. Like the constructor, you can also include template strings with {}.
     */
    this.setContent = function(content) {
        this.rawContent = content;


    };

    /**
     * Method to replace the template strings with user-defined values.
     * @private
     */
    this.compiledContents = function(){ 
        var templateKeys = Object.keys(this.templateNames); //Get the keys
        var tempNames = this.templateNames; //We have to copy this over because we can't use "this" is in forEach function below
        var outContent = this.rawContent;

        templateKeys.forEach(function(aKey){
            var replaceExpression = new RegExp("\{"+aKey+"\}",'g');
            outContent = outContent.replace(replaceExpression,tempNames[aKey]);


        });

        return outContent;       
    }

    /**
     * Sets up the HTML for the popup and displays it. Also interprets the template strings
     * @private
     */
    this.setupPopup = function() {
        var ppopupDiv = document.createElement('div');
        ppopupDiv.className = "ppopup-waiting"
        ppopupDiv.id = "ppopup-"+this.id;
        ppopupDiv.innerHTML = '<div class="ppopup-overlay"></div><div class="ppopup-container">'+this.compiledContents()+'</div>';
        
        if (this.closeButton) {
            var popupContainer = ppopupDiv.childNodes[1];
            var buttonDiv = document.createElement('div');
            buttonDiv.id = "popup-button-"+this.id;
            buttonDiv.innerHTML = `<button type="button">${this.closeCaption}</button>`;
            popupContainer.appendChild(buttonDiv);
            var thisObject = this;
            buttonDiv.addEventListener('click',function() {
                thisObject.hidePopup();
            })

        }
        
        document.body.appendChild(ppopupDiv);
        this.showing = true;
    };

    

    /**
     * Parse the possible values in the options object
     * @private
     * @param {object} options 
     */
    this.parseOptions = function(options) {
        if ('callback' in options) {
            this.callback = options.callback;
        }

        if ('templateKeys' in options) {
            this.templateNames = options.templateKeys;
        }

        if ('closeButton' in options) {
            this.closeButton = options.closeButton;
        }

        if ('closeCaption' in options) {
            this.closeCaption = options.closeCaption;
        }


    };

    /**
     * @name PanelPopup#showPopup
     * @function
     * @description Show the popup
     *//** 
     * @name PanelPopup#showPopup
     * @function
     * @description Set the popup contents and then display it.
     * @param {string} content - The text content of the overlay. Should be HTML formatted. While you can, in theory, include basic template strings by enclosing text in {}, there isn't really a point as there's no place for you to set the replacements.
     *//**
     * @name PanelPopup#showPopup
     * @function
     * @description Set some display options for the popup and then display it.
     * @param {options} options - Specialized options for the popup. None are required.
     *//** 
     * @name PanelPopup#showPopup
     * @function
     * @description Set the contents and some display options for the popup and then display it.
     * @param {string} content - The text content of the overlay. Should be HTML formatted.
     * @param {options} options - Specialized options for the popup. None are required.
     * 
     */
    this.showPopup = function(content,options) {

        
        
        if (typeof content == 'string') {
            this.setContent(content);
        } else if (typeof content == 'object') {
            this.parseOptions(content)
        }

        if (typeof options == 'object') {
            this.parseOptions(options);
        }

        

        this.setupPopup();

    };
    
    /**
     * Hide the popup.
     * @param {function} [callback] - Optional callback. If you've already set a callback when you called showPopup, this callback will replace that one.
     */
    this.hidePopup = function(callback) {
        if (this.showing) {
            
            var panel = document.getElementById("ppopup-"+this.id);
            document.body.removeChild(panel);
            this.showing = false;

            var myCallback = callback || this.callback;
    
            if (myCallback) {
                myCallback();
            }
    
        }
    
    

    }
}