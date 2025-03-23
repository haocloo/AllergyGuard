/**
 * game logic
 */
var timeline = require( "timeline" );
var Ucren = require( "lib/ucren" );
var sound = require( "lib/sound" );
var fruit = require( "factory/fruit" );
var score = require( "object/score" );
var message = require( "message" );
var state = require( "state" );
var lose = require( "object/lose" );
var gameOver = require( "object/game-over" );
var knife = require( "object/knife" );
// var sence = require( "sence" );
var background = require( "object/background" );
var light = require( "object/light" );

var scoreNumber = 0;

// Track wrongly cut allergens for final results
var wronglyCutItems = [];
var allergenExplanations = {
    "milk": "Milk contains proteins (casein and whey) that can cause allergic reactions. People with milk allergies should avoid all dairy products.",
    "cheese": "Cheese is made from milk and contains the same proteins that trigger milk allergies. Even small amounts can cause reactions in sensitive people.",
    "icecream": "Ice cream is made with milk and cream, making it a major allergen for people with dairy allergies.",
    "cake": "Many cakes contain milk, butter, and sometimes cream. These dairy ingredients can cause allergic reactions.",
    "yoghurt": "Yoghurt is made by fermenting milk and contains the same allergenic proteins."
};

var random = Ucren.randomNumber;

var volleyNum = 2, volleyMultipleNumber = 5;
var fruits = [];
var gameInterval;

var snd;
var boomSnd;

// fruit barbette
var barbette = function(){
    if( fruits.length >= volleyNum )
        return ;

    var startX = random( 640 ), endX = random( 640 ), startY = 600;
    var f = fruit.create( startX, startY ).shotOut( 0, endX );

    fruits.push( f );
    snd.play();

    barbette();
};

// start game
exports.start = function(){
    snd = sound.create( "sound/throw" );
    boomSnd = sound.create( "sound/boom" );
    
    // Add the debug button and event listeners
    setTimeout(function() {
        exports.addDebugTriggerButton();
        exports.addDirectEventListeners();
    }, 2000);
    
    timeline.setTimeout(function(){
        state( "game-state" ).set( "playing" );
        gameInterval = timeline.setInterval( barbette, 1e3 );
    }, 500);
};

exports.gameOver = function(){
    state( "game-state" ).set( "over" );
    gameInterval.stop();

    gameOver.show();
    
    console.log("Game over called, wrongly cut items:", wronglyCutItems);

    // Adding a test dairy item to ensure results display (for debugging only)
    if (wronglyCutItems.length === 0) {
        wronglyCutItems.push("cheese");
        console.log("Added test item for debugging");
    }

    // Show allergen results when game is over with multiple attempts
    // First attempt
    timeline.setTimeout(function() {
        // Try to call the global function
        if (typeof window.forceShowAllergenResults === 'function') {
            window.forceShowAllergenResults();
        } else {
            // Fall back to direct creation
            createAllergenResultsOverlay();
        }
        console.log("Delayed allergen results call executed");
    }, 2000);
    
    // Second attempt
    timeline.setTimeout(function() {
        if (!document.getElementById('allergen-results')) {
            createAllergenResultsOverlay();
            console.log("Second attempt at creating allergen results");
        }
    }, 3500);

    scoreNumber = 0;
    volleyNum = 2;
    fruits.length = 0;
};

exports.applyScore = function( score ){
    if( score > volleyNum * volleyMultipleNumber )
        volleyNum ++,
        volleyMultipleNumber += 50;
};

exports.sliceAt = function( fruit, angle ){
    var index;

    if( state( "game-state" ).isnot( "playing" ) )
        return;

    // Check if the fruit is a dairy allergen
    var dairyItems = ["milk", "cheese", "icecream", "cake", "yoghurt"];
    var isDairy = dairyItems.indexOf(fruit.type) > -1;

    if( fruit.type != "boom" && !isDairy ){
        fruit.broken( angle );
        if( index = fruits.indexOf( fruit ) )
            fruits.splice( index, 1 );
        score.number( ++ scoreNumber );
        this.applyScore( scoreNumber );
    } else if (isDairy) {
        // When dairy item is cut, still deduct a life
        fruit.broken( angle );
        if( index = fruits.indexOf( fruit ) )
            fruits.splice( index, 1 );
        lose.showLoseAt( fruit.originX );
        
        // Track the wrongly cut item
        wronglyCutItems.push(fruit.type);
    } else {
        // It's a bomb
        boomSnd.play();
        this.pauseAllFruit();
        background.wobble();
        light.start( fruit );
    }
};

exports.pauseAllFruit = function(){
    gameInterval.stop();
    knife.pause();
    fruits.invoke( "pause" );
};

// message.addEventListener("fruit.fallOff", function( fruit ){
// 	var index;
// 	if( ( index = fruits.indexOf( fruit ) ) > -1 )
// 	    fruits.splice( index, 1 );
// });

message.addEventListener("fruit.remove", function( fruit ){
    var index;
    if( ( index = fruits.indexOf( fruit ) ) > -1 )
        fruits.splice( index, 1 );
});

var eventFruitFallOutOfViewer = function( fruit ){
    // Define dairy items that shouldn't deduct a life when falling off the screen
    var dairyItems = ["milk", "cheese", "icecream", "cake", "yoghurt"];
    
    // Only deduct a life if it's not a bomb and not a dairy item
    if( fruit.type != "boom" && dairyItems.indexOf(fruit.type) === -1 )
        lose.showLoseAt( fruit.originX );
    // If it's a dairy item falling out, we don't deduct a life (doing nothing)
};

state( "game-state" ).hook( function( value ){
    if( value == "playing" )
        message.addEventListener( "fruit.fallOutOfViewer", eventFruitFallOutOfViewer );
    else
        message.removeEventListener( "fruit.fallOutOfViewer", eventFruitFallOutOfViewer );
} );

message.addEventListener("game.over", function(){
    exports.gameOver();
    knife.switchOn();
    
    // Force-check for allergen results after multiple delays to ensure display
    // First check
    timeline.setTimeout(function() {
        console.log("First check for allergen results");
        if (!document.getElementById('allergen-results')) {
            exports.showAllergenResults();
        }
    }, 1500);
    
    // Second check as backup
    timeline.setTimeout(function() {
        console.log("Second check for allergen results");
        if (!document.getElementById('allergen-results')) {
            exports.showAllergenResults();
        }
    }, 3000);
    
    // Third check as last resort
    timeline.setTimeout(function() {
        console.log("Third check for allergen results");
        if (!document.getElementById('allergen-results')) {
            exports.showAllergenResults();
        }
    }, 4500);
});

message.addEventListener("overWhiteLight.show", function(){
    knife.endAll();
    for(var i = fruits.length - 1; i >= 0; i --)
        fruits[i].remove();
    background.stop();
});

// New listener for allergen results
message.addEventListener("show.allergen.results", function(){
    console.log("Message received: show.allergen.results");
    if (wronglyCutItems.length === 0) {
        wronglyCutItems.push("cheese");
        console.log("Added test item via message handler");
    }
    exports.showAllergenResults();
});

message.addEventListener("click", function(){
    state( "click-enable" ).off();
    gameOver.hide();
    
    // Clean up allergen results with more robust approach
    try {
        // Try multiple ways to find and remove the overlay
        var allergenResults = document.getElementById('allergen-results');
        if (allergenResults) {
            if (allergenResults.parentNode) {
                allergenResults.parentNode.removeChild(allergenResults);
            } else {
                allergenResults.style.display = 'none';
            }
            console.log("Allergen results cleaned up on menu return");
        }
        
        // Also find by className in case ID search doesn't work
        var resultElements = document.querySelectorAll('[id*="allergen"]');
        for (var i = 0; i < resultElements.length; i++) {
            if (resultElements[i].parentNode) {
                resultElements[i].parentNode.removeChild(resultElements[i]);
            }
        }
    } catch(e) {
        console.error("Error cleaning up allergen results:", e);
    }
    
    // Now clear the wrongly cut items
    wronglyCutItems = [];
    
    message.postMessage( "home-menu", "sence.switchSence" );
});

// New function to show allergen results
exports.showAllergenResults = function() {
    console.log("Attempting to show allergen results");
    
    // Remove any existing results
    var existingResult = document.getElementById('allergen-results');
    if (existingResult && existingResult.parentNode) {
        existingResult.parentNode.removeChild(existingResult);
    }
    
    // Create a full-screen overlay without scrolling needed
    var overlay = document.createElement('div');
    overlay.id = 'allergen-results';
    
    // Set base overlay properties
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.93)';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.fontFamily = 'Arial, sans-serif';
    
    // Get dairy items that were cut, or use defaults if none
    var itemsToShow = [];
    if (wronglyCutItems && wronglyCutItems.length > 0) {
        // Get unique items
        var uniqueItems = [];
        wronglyCutItems.forEach(function(item) {
            if (uniqueItems.indexOf(item) === -1) {
                uniqueItems.push(item);
            }
        });
        itemsToShow = uniqueItems;
    } else {
        // Default examples
        itemsToShow = ["cheese", "milk", "icecream", "cake", "yoghurt"];
    }
    
    // Create HTML content that fits on screen without scrolling
    var html = '<div style="background:rgba(0,0,0,0.95); max-width:90%; width:600px; border:5px solid #ff5252; border-radius:15px; padding:20px; box-shadow:0 0 30px rgba(255,0,0,0.8); color:white; position:relative;">';
    
    // Add close button at the top right
    html += '<button id="top-close-btn" style="position:absolute; top:10px; right:10px; background:#ff5252; color:white; border:none; border-radius:50%; width:30px; height:30px; font-size:16px; font-weight:bold; cursor:pointer; z-index:9999999;">✖</button>';
    
    // Title and header
    html += '<h2 style="color:#ff5252; text-align:center; margin-bottom:15px; font-size:26px; text-shadow:0 0 5px rgba(255,82,82,0.7);">⚠️ Allergen Alert! ⚠️</h2>';
    html += '<p style="text-align:center; margin-bottom:15px; font-size:16px; color:#ffcc00;">Oops! You cut these foods that contain DAIRY allergens:</p>';
    
    // Create a grid layout for the allergen items (hover to see info)
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px; margin:10px 0;">';
    
    // Add allergen items with hover effect
    itemsToShow.forEach(function(item) {
        var name = item.charAt(0).toUpperCase() + item.slice(1);
        var desc = allergenExplanations[item] || "This item contains dairy allergens that can cause reactions.";
        
        html += '<div class="allergen-item" style="position:relative; background:rgba(255,82,82,0.2); border-radius:10px; border-left:5px solid #ff5252; padding:12px; text-align:center; cursor:pointer; transition:all 0.3s ease;">' +
                '<strong style="color:#ff9e9e; font-size:16px; display:block;">🚫 ' + name + '</strong>' +
                '<div class="allergen-desc" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); border-radius:10px; padding:10px; opacity:0; transition:opacity 0.3s ease; display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">' +
                '<p style="font-size:14px; margin:0;">' + desc + '</p>' +
                '</div>' +
                '</div>';
    });
    
    html += '</div>'; // Close the grid container
    
    // Add tip section
    html += '<div style="background:rgba(76,175,80,0.2); padding:12px; border-radius:10px; margin:15px 0 10px; border-left:5px solid #4CAF50;">' +
            '<p style="margin:0; color:#a5d6a7; font-size:14px;"><strong>💡 TIP:</strong> Always read food labels and ask about ingredients to stay safe!</p>' +
            '</div>';
    
    // Note about how to view descriptions
    html += '<p style="text-align:center; font-size:14px; margin:10px 0; color:#aaa;">Hover/tap on an allergen to see details</p>';
    
    // Large, obvious close button
    html += '<button id="allergen-close-btn" style="display:block; width:80%; margin:10px auto 0; padding:12px 20px; background:#4CAF50; color:white; border:none; border-radius:30px; cursor:pointer; font-size:18px; font-weight:bold; box-shadow:0 4px 8px rgba(76,175,80,0.5);">👍 Got it!</button>';
    
    html += '</div>'; // Close main container
    
    overlay.innerHTML = html;
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Add hover and click behavior for allergen items
    var allergenItems = overlay.querySelectorAll('.allergen-item');
    allergenItems.forEach(function(item) {
        // For mouse devices - hover shows description
        item.addEventListener('mouseenter', function() {
            var desc = this.querySelector('.allergen-desc');
            if (desc) desc.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', function() {
            var desc = this.querySelector('.allergen-desc');
            if (desc) desc.style.opacity = '0';
        });
        
        // For touch devices - tap toggles description
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            var desc = this.querySelector('.allergen-desc');
            if (desc) {
                if (desc.style.opacity === '1') {
                    desc.style.opacity = '0';
                    desc.style.pointerEvents = 'none';
                } else {
                    // First, hide all other descriptions
                    allergenItems.forEach(function(otherItem) {
                        var otherDesc = otherItem.querySelector('.allergen-desc');
                        if (otherDesc) {
                            otherDesc.style.opacity = '0';
                            otherDesc.style.pointerEvents = 'none';
                        }
                    });
                    
                    // Then show this one
                    desc.style.opacity = '1';
                    desc.style.pointerEvents = 'auto';
                }
            }
        });
    });
    
    // Add click event handlers for both close buttons
    setTimeout(function() {
        var closeBtn = document.getElementById('allergen-close-btn');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            };
        }
        
        var topCloseBtn = document.getElementById('top-close-btn');
        if (topCloseBtn) {
            topCloseBtn.onclick = function(e) {
                e.stopPropagation();
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            };
        }
        
        // Prevent event propagation for the main overlay
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }, 100);
    
    console.log("No-scroll, hover-based allergen results overlay created");
}

// Make the function globally available
window.forceShowAllergenResults = createAllergenResultsOverlay;

// Add a hidden button that can trigger the display
exports.addDebugTriggerButton = function() {
    var btn = document.createElement('button');
    btn.id = 'debug-trigger-btn';
    btn.textContent = 'Show Allergen Results';
    btn.style.position = 'fixed';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    btn.style.padding = '5px 10px';
    btn.style.background = 'rgba(0,0,0,0.5)';
    btn.style.color = 'white';
    btn.style.border = '1px solid red';
    btn.style.cursor = 'pointer';
    
    btn.onclick = function() {
        console.log("Debug button clicked");
        if (wronglyCutItems.length === 0) {
            wronglyCutItems = ["cheese", "milk"]; // Add test items for debugging
        }
        exports.showAllergenResults();
    };
    
    document.body.appendChild(btn);
    console.log("Debug button added to page");
};

// Add direct DOM event listeners
exports.addDirectEventListeners = function() {
    // Listen for DOM events directly
    document.addEventListener("show-allergen-results", function() {
        console.log("DOM event received: show-allergen-results");
        if (wronglyCutItems.length === 0) {
            wronglyCutItems.push("cheese", "milk", "cake");
            console.log("Added test items via DOM event");
        }
        exports.showAllergenResults();
    });
    
    console.log("Direct DOM event listeners added");
    
    // Also check for trigger element periodically
    setInterval(function() {
        var trigger = document.getElementById('trigger-allergen-results');
        if (trigger) {
            console.log("Trigger element found");
            if (wronglyCutItems.length === 0) {
                wronglyCutItems.push("cheese", "yoghurt");
                console.log("Added test items via trigger element");
            }
            exports.showAllergenResults();
            
            // Remove the trigger
            if (trigger.parentNode) {
                trigger.parentNode.removeChild(trigger);
            }
        }
    }, 1000);
};