var layer = require( "../layer" );
var tween = require( "../lib/tween" );
var timeline = require( "../timeline" );
var message = require( "../message" );
var state = require( "../state" );

var exponential = tween.exponential.co;

/**
 * "game-over"模块
 */

exports.anims = [];

exports.set = function(){
	this.image = layer.createImage( "default", "images/game-over.png", 75, 198, 490, 85 ).hide().scale( 1e-5, 1e-5 );
};

exports.show = function( start ){
    timeline.createTask({
		start: start, duration: 500, data: [ 1e-5, 1, "show" ],
		object: this, onTimeUpdate: this.onZooming, onTimeStart: this.onZoomStart, onTimeEnd: this.onZoomEnd,
		recycle: this.anims
	});
	
	// Directly show allergen results after the game over animation completes
	timeline.setTimeout(function() {
	    forceShowAllergenResults();
	    console.log("Game over directly called allergen results function");
	}, 1200);
};

exports.hide = function( start ){
    timeline.createTask({
		start: start, duration: 500, data: [ 1, 1e-5, "hide" ],
		object: this, onTimeUpdate: this.onZooming, onTimeStart: this.onZoomStart, onTimeEnd: this.onZoomEnd,
		recycle: this.anims
	});
};

// 显示/隐藏 相关

exports.onZoomStart = function( sz, ez, mode ){
	if( mode == "show" )
		this.image.show();
};

exports.onZooming = function( time, sz, ez, z ){
	this.image.scale( z = exponential( time, sz, ez - sz, 500 ), z );
};

exports.onZoomEnd = function( sz, ez, mode ){
	if( mode == "show" ) {
		state( "click-enable" ).on();
		// Also try to directly show allergen results when zoom ends
		setTimeout(forceShowAllergenResults, 500);
	} else if( mode === "hide" )
        this.image.hide();
};

// Direct function to force allergen results to display
function forceShowAllergenResults() {
    console.log("Force showing allergen results from game-over.js");
    
    // Remove any existing results first
    var existingResult = document.getElementById('allergen-results');
    if (existingResult) {
        existingResult.parentNode.removeChild(existingResult);
    }
    
    var overlay = document.createElement('div');
    overlay.id = 'allergen-results';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.fontFamily = 'Arial, sans-serif';
    
    // SIMPLIFY - use HTML with hover/tap functionality instead of scrolling
    var html = '<div style="background:rgba(0,0,0,0.95); max-width:90%; width:600px; border:5px solid #ff5252; border-radius:15px; padding:20px; box-shadow:0 0 30px rgba(255,0,0,0.8); color:white; position:relative;">';
    
    // Add X button at top right
    html += '<button id="allergen-top-close" style="position:absolute; top:10px; right:10px; background:#ff5252; color:white; border:none; border-radius:50%; width:30px; height:30px; font-size:16px; cursor:pointer; z-index:10; display:flex; justify-content:center; align-items:center; font-weight:bold;">✖</button>';
    
    // Title and header
    html += '<h2 style="color:#ff5252; text-align:center; margin-bottom:15px; font-size:26px; text-shadow:0 0 5px rgba(255,82,82,0.7); padding-right:30px;">⚠️ Allergen Alert! ⚠️</h2>';
    html += '<p style="text-align:center; margin-bottom:15px; font-size:16px; color:#ffcc00;">Oops! You cut these foods that contain DAIRY allergens:</p>';
    
    // Create a grid layout for allergen items (hover/tap to see info)
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px; margin:10px 0;">';
    
    // List of allergen items with hover/tap functionality
    var allergens = [
        { name: "Cheese", desc: "Cheese is made from milk and contains the same proteins that trigger milk allergies. Even small amounts can cause reactions in sensitive people." },
        { name: "Milk", desc: "Milk contains proteins (casein and whey) that can cause allergic reactions. People with milk allergies should avoid all dairy products." },
        { name: "Ice cream", desc: "Ice cream is made with milk and cream, making it a major allergen for people with dairy allergies." },
        { name: "Cake", desc: "Many cakes contain milk, butter, and sometimes cream. These dairy ingredients can cause allergic reactions." },
        { name: "Yoghurt", desc: "Yoghurt is made by fermenting milk and contains the same allergenic proteins." }
    ];
    
    allergens.forEach(function(item) {
        html += '<div class="allergen-item" style="position:relative; background:rgba(255,82,82,0.2); border-radius:10px; border-left:5px solid #ff5252; padding:12px; text-align:center; cursor:pointer; transition:all 0.3s ease;">' +
               '<strong style="color:#ff9e9e; font-size:16px; display:block;">🚫 ' + item.name + '</strong>' +
               '<div class="allergen-desc" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); border-radius:10px; padding:10px; opacity:0; transition:opacity 0.3s ease; display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">' +
               '<p style="font-size:14px; margin:0;">' + item.desc + '</p>' +
               '</div>' +
               '</div>';
    });
    
    html += '</div>'; // Close grid container
    
    // Note about hover/tap functionality
    html += '<p style="text-align:center; font-size:14px; margin:10px 0; color:#aaa;">Hover/tap on an allergen to see details</p>';
    
    // Add tip
    html += '<div style="background:rgba(76,175,80,0.2); padding:12px; border-radius:10px; margin:10px 0; border-left:5px solid #4CAF50;">' +
            '<p style="margin:0; color:#a5d6a7; font-size:14px;"><strong>💡 TIP:</strong> Always read food labels and ask about ingredients to stay safe!</p>' +
            '</div>';
    
    // Bottom close button - bigger and more visible
    html += '<button id="allergen-close-btn" style="display:block; width:80%; margin:15px auto 5px; padding:12px 20px; background:#4CAF50; color:white; border:none; border-radius:30px; cursor:pointer; font-size:18px; font-weight:bold; box-shadow:0 4px 8px rgba(76,175,80,0.5);">👍 Got it!</button>';
    
    html += '</div>';
    
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    
    // Add event listeners for both close buttons and hover functionality
    setTimeout(function() {
        // Set up hover/tap behavior for allergen items
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
                        // Hide all other descriptions first
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
        
        // Set up close button click handlers
        var closeBtn = document.getElementById('allergen-close-btn');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            };
        }
        
        var topCloseBtn = document.getElementById('allergen-top-close');
        if (topCloseBtn) {
            topCloseBtn.onclick = function(e) {
                e.stopPropagation();
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            };
        }
        
        // Make sure clicks don't pass through to game elements
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }, 100);
    
    console.log("Hover-based allergen results overlay added to body");
}