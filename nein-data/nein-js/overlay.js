YUI.add('ez-overlay', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.Overlay
     *
     * @module ez-overlay
     */

    Y.namespace('eZ');
    
    var Lang = Y.Lang,
        currentTargetLevel = 1,
        currentTargetParent = '';


    /**
     * First simplest implementation of targeting overlays. 
     *
     *
     * @class Y.eZ.Overlay
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    
    function eZOverlay(config) {
        eZOverlay.superclass.constructor.apply(this, arguments);
    }

    eZOverlay.NAME = 'overlay';
    eZOverlay.CSS_PREFIX = "ez-ei-" + eZOverlay.NAME;

    eZOverlay.ATTRS = {

        overlayClassName: {
            value: 'ez-ei-overlay'
        },
        overlayMarkerClassName: {
            value: 'ez-ei-overlay-marker'
        }
    
    };

    eZOverlay.HTML_PARSER = {
    };

    Y.extend(eZOverlay, Y.Widget, {
        initializer: function () {
        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {

        },

        showOverlays: function (targetLevel, targetParent, markerPrefix){
            // forcing defaults, if params ommited
            targetLevel = typeof targetLevel !== 'undefined' ? targetLevel : 1;
            targetParent = typeof targetParent !== 'undefined' ? targetParent : '';
            markerPrefix = typeof markerPrefix !== 'undefined' ? markerPrefix : '';

//            console.log(currentTargetLevel + ' ' + currentTargetParent  + ' ' + targetLevel  + ' ' + targetParent);

            if (targetLevel != currentTargetLevel || targetParent != currentTargetParent){
                currentTargetLevel = targetLevel;
                currentTargetParent = targetParent;
                this._createOverlays(markerPrefix);
                this.syncOverlays();
            }
            else{
                var overlayNodes = Y.all('.'+this.get('overlayClassName'));

                if (!overlayNodes.isEmpty() ){
                    overlayNodes.show();                
                }
                else{
                    this._createOverlays(markerPrefix);
                    this.syncOverlays();
                }
            }
            
            this.flagVisible = true;

        },
        

        hideOverlays: function () {
            var overlayNodes = Y.all('.'+this.get('overlayClassName'));
            if (!overlayNodes.isEmpty() ){
                overlayNodes.hide();                
            }

            this.flagVisible = false;    
        },
        
        /** 
         * Synchronizing every overlay to size, position and visibility of it's target.
         * Should be called by editorial interface on every overlay-wise important event.
         * @method syncOverlays
         */

        syncOverlays: function (){
            
            if (this.flagVisible){

                var overlayNodes = Y.all('.'+this.get('overlayClassName')),
                    that = this;

                if (!overlayNodes.isEmpty() ){
                    overlayNodes.each(function (overlayNode){
                        var targetNode = Y.one('#'+overlayNode.getAttribute('data-ez-overlay-target'));
                        that._syncNodes(targetNode, overlayNode);
                    });
                }
            }
        },
        
        
        _createOverlays: function (markerPrefix){
            this._killOverlays();
            
            var targetCSSselector = '';
            if (currentTargetParent){
                targetCSSselector += '#' + currentTargetParent + ' ';
            }
            targetCSSselector += '[data-ez-editable-region="true"][data-ez-editable-region-level='+ currentTargetLevel +']';
//            console.log('target selector:' + targetCSSselector);
            
            var targetNodes = Y.all(targetCSSselector),
            
                overlayClassName = this.get("overlayClassName"),
                markerClassName = this.get("overlayMarkerClassName"),
                
                sourceNode = this.get('srcNode'),
                that = this;
            
            if (!targetNodes.isEmpty() ){
                targetNodes.each(function (targetNode,index){
                    
                    // marker indexing logic    
                    var markerStr = '';
                    if (markerPrefix){
                        markerStr = markerPrefix + '.' + (index + 1);
                    }
                    else{
                        markerStr += index+1;
                    }
                    
                    
                    var overlayNode = Y.Node.create(['<div class="',overlayClassName,'" data-ez-overlay-order="', index+1,'" data-ez-overlay-target="',targetNode.getAttribute('id'),'"></div>'].join('')),
                        markerNode = Y.Node.create(['<div class="',markerClassName,'">',markerStr,'</div>'].join(''));
                    
                    markerNode.addClass('ez-ei-overlay-marker-blocks');
                    
                    if (targetNode.getAttribute('data-ez-field-type-identifier') == 'ezstring' 
                    ||  targetNode.getAttribute('data-ez-field-type-identifier') == 'eztext' ) {
                        markerNode.removeClass('ez-ei-overlay-marker-blocks');
                        markerNode.addClass('ez-ei-overlay-marker-text');
                    }
                    if (targetNode.getAttribute('data-ez-field-type-identifier') == 'ezimage') {
                        markerNode.removeClass('ez-ei-overlay-marker-blocks');
                        markerNode.addClass('ez-ei-overlay-marker-image');
                    }
                    if (targetNode.getAttribute('data-ez-field-type-identifier') == 'ezselection'
                    ||  targetNode.getAttribute('data-ez-field-type-identifier') == 'ezobjectrelationlist') {
                        markerNode.removeClass('ez-ei-overlay-marker-blocks');
                        markerNode.addClass('ez-ei-overlay-marker-list');
                    }

                    overlayNode.appendChild(markerNode);
                    targetNode.setAttribute('data-ez-editable-region-marker',markerStr);

                    

                    
                    sourceNode.appendChild(overlayNode);
                    that._syncNodes(targetNode, overlayNode);
                    
                });
                
                var overlayNodes = Y.all('.'+this.get('overlayClassName'));
                sourceNode.delegate('click', this._overlayClick, ".ez-ei-overlay" );
                overlayNodes.on('mouseover', Y.bind(this._overlayMouseOver, this));
                overlayNodes.on('mouseout', Y.bind(this._overlayMouseOut, this));
                
            }

        },
        
        _killOverlays: function (){
            var overlayNodes = Y.all('.'+this.get('overlayClassName'));
            if (!overlayNodes.isEmpty() ){
                overlayNodes.remove(true);
            }
        },
        
        /** 
         * Synchronizing 2 nodes position, size and visibility
         * @method _syncNodes
         */
        _syncNodes: function (targetNode, overlayNode){

            var targetWidth = targetNode.get('offsetWidth'),
                targetHeight = targetNode.get('offsetHeight'),
                targetDisplay = targetNode.getStyle('display'),
                targetVisible = targetNode.getStyle('visibility');

            if (targetDisplay == 'inline') {
                targetDisplay = 'block';
            }

            // adjusting minimal height to marker height
            if (targetHeight < 26) {
                targetHeight = 26;
            }

            overlayNode.setStyles({'width':targetWidth, 'height':targetHeight, 'display': targetDisplay, 'visibility':targetVisible});
            overlayNode.setX(targetNode.getX());
            overlayNode.setY(targetNode.getY());

        },
        
       _overlayMouseOver: function (e){
           if (e.target.hasClass(this.get('overlayClassName'))){
                e.target.transition({
                        duration: 0.2, // seconds
                        backgroundColor: 'rgba(255, 247, 0, 0.2)'});
           }
        },

       _overlayMouseOut: function (e){
           if (e.target.hasClass(this.get('overlayClassName'))){
                e.target.transition({
                        duration: 0.2, // seconds
                        backgroundColor: 'rgba(255, 247, 0, 0.06)'});
           }
        },

        _overlayClick: function (e){
            Y.fire('overlay:overlayClicked',{}, Y.one('#' + this.getAttribute('data-ez-overlay-target')) );
        }
        
    });

    Y.eZ.Overlay = eZOverlay;

}, '0.2alpha', ['widget','event-custom']);
