YUI.add('ez-focused-overlay', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.FocusedOverlay
     *
     * @module ez-focused-overlay
     */

    Y.namespace('eZ');
    
    var Lang = Y.Lang,
        sourceNode,
        background3Node,
        background6Node,
        background9Node,
        background12Node,
        frame3Node,
        frame6Node,
        frame9Node,
        frame12Node,
        dialogHeaderNode,
        dialogToolBarNode,
        dialog3Node,
        dialog6Node,
        dialog9Node,
        shadow3Node,
        shadow6Node,
        shadow9Node,
        shadow12Node;
        


    /**
     * First simplest implementation of focused overlays. 
     *
     *
     * @class Y.eZ.FocusedOverlay
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    
    function eZFocusedOverlay(config) {
        eZFocusedOverlay.superclass.constructor.apply(this, arguments);
    }

    eZFocusedOverlay.NAME = 'focused-overlay';
    eZFocusedOverlay.CSS_PREFIX = "ez-ei-" + eZFocusedOverlay.NAME;

    eZFocusedOverlay.ATTRS = {

        backgroundClassNamePrefix: {
            value: '-background'
        },
        frameClassNamePrefix:{
            value: '-frame'
        },
        dialogClassNamePrefix:{
            value: '-dialog'
        },
        shadowClassNamePrefix:{
            value: '-shadow'
        },
        
        frameDefaultWidth:{
            value: 6
        },
        dialogDefaultWidth:{
            value: 5
        },
        dialogToolBarHeight:{
            value: 65
        },
        dialogHeaderHeight:{
            value: 31
        },
        dialogToolBarMinWidth:{
            value: 322
        },
        
        dialogToolBarId:{
            value: '-toolbar'
        },
        dialogHeaderId:{
            value: '-header'
        }

    };

    eZFocusedOverlay.HTML_PARSER = {
    };

    Y.extend(eZFocusedOverlay, Y.Widget, {
        initializer: function () {
            sourceNode = this.get('srcNode');
            this.sourceNodeYOffset = 0;
        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {

        },


        showFocusedOverlay: function (focusedNode){
            
            if (focusedNode){

                if ( !this._getFocusedOverlayTarget() ){
                    this._createFocusedOverlayNodes(focusedNode);
                    this._syncFocusedOverlayNodes(focusedNode);
                }
                else{
                    this._showFocusedOverlayNodes();
                    this._syncFocusedOverlayNodes(focusedNode);
                }
                
                this.flagVisible = true;
                
                this._scrollToHeader();

            }

        },
        
        syncFocusedOverlay: function (){
            
            if (this.flagVisible){

                var focusedNode = this._getFocusedOverlayTarget();

                if ( focusedNode){
                    this._syncFocusedOverlayNodes(focusedNode);
                }
            }
        },
        
        hideFocusedOverlay: function (){
            
//            sourceNode.setX(sourceParentNode.getX());
            // resetting position
            sourceNode.setY(sourceNode.getY() - this.sourceNodeYOffset);
            this.sourceNodeYOffset = 0;

            this._hideFocusedOverlayNodes();
            this.flagVisible = false;
        },

        _scrollToHeader: function (){
            var headerY = dialogHeaderNode.getY(),
                wrapper = Y.one('.ez-ei-content-wrapper'),
                wrapperHeight = parseInt(wrapper.getComputedStyle('height'),10);

            if ( (headerY < 0) || (headerY > wrapperHeight) ){
                dialogHeaderNode.scrollIntoView(true);
            }
        },

        /** 
         * Checking overlay existance and getting it's target node for future use
         * @method _syncFocusedOverlay
         */
        _getFocusedOverlayTarget: function (){
            
            if (dialogToolBarNode){
                return Y.one('#' + dialogToolBarNode.getAttribute('data-ez-focused-overlay-target-id'));                
            }
            else{
                return false;
            }
        },


        /** 
         * Creating all divs neccessary for the overlay
         * @method _syncFocusedOverlay
         */
        /**
         * 4-divs scheme (on example of background):
         * Imagining face of a clock:
         * 
         *                          background-12
         *   
         *         background-9     *focusedNode*  background-3
         *
         *                          background-6
         */
        _createFocusedOverlayNodes: function (focusedNode){
            var cssPrefix = eZFocusedOverlay.CSS_PREFIX,
                backgroundClassNamePrefix = cssPrefix + this.get("backgroundClassNamePrefix"),
                frameClassNamePrefix = cssPrefix + this.get("frameClassNamePrefix"),
                dialogClassNamePrefix = cssPrefix + this.get("dialogClassNamePrefix"),
                shadowClassNamePrefix = cssPrefix + this.get("shadowClassNamePrefix");
            
            background3Node = Y.Node.create(['<div class="',backgroundClassNamePrefix,'-3 ',backgroundClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            background6Node = Y.Node.create(['<div class="',backgroundClassNamePrefix,'-6 ',backgroundClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            background9Node = Y.Node.create(['<div class="',backgroundClassNamePrefix,'-9 ',backgroundClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            background12Node = Y.Node.create(['<div class="',backgroundClassNamePrefix,'-12 ',backgroundClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));

            frame3Node = Y.Node.create(['<div class="',frameClassNamePrefix,'-3 ',frameClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            frame6Node = Y.Node.create(['<div class="',frameClassNamePrefix,'-6 ',frameClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            frame9Node = Y.Node.create(['<div class="',frameClassNamePrefix,'-9 ',frameClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            frame12Node = Y.Node.create(['<div class="',frameClassNamePrefix,'-12 ',frameClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));

            dialogHeaderNode = Y.Node.create([ '<div id="',cssPrefix + this.get("dialogHeaderId"),'" class="',cssPrefix,'">','</div>'].join(''));

            this._createToolBarNode(focusedNode);
            dialogToolBarNode.setAttribute('data-ez-focused-overlay-target-id', focusedNode.getAttribute('id'));
                
            dialog3Node = Y.Node.create(['<div class="',dialogClassNamePrefix,'-3 ',dialogClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            dialog6Node = Y.Node.create(['<div class="',dialogClassNamePrefix,'-6 ',dialogClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            dialog9Node = Y.Node.create(['<div class="',dialogClassNamePrefix,'-9 ',dialogClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));

            shadow3Node = Y.Node.create(['<div class="',shadowClassNamePrefix,'-3 ',shadowClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            shadow6Node = Y.Node.create(['<div class="',shadowClassNamePrefix,'-6 ',shadowClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            shadow9Node = Y.Node.create(['<div class="',shadowClassNamePrefix,'-9 ',shadowClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));
            shadow12Node = Y.Node.create(['<div class="',shadowClassNamePrefix,'-12 ',shadowClassNamePrefix,' ',cssPrefix,'" ></div>'].join(''));

            sourceNode.appendChild(background3Node);
            sourceNode.appendChild(background6Node);
            sourceNode.appendChild(background9Node);
            sourceNode.appendChild(background12Node);
            
            sourceNode.appendChild(frame3Node);
            sourceNode.appendChild(frame6Node);
            sourceNode.appendChild(frame9Node);
            sourceNode.appendChild(frame12Node);
            
            sourceNode.appendChild(dialogHeaderNode);            
            sourceNode.appendChild(dialogToolBarNode);
            sourceNode.appendChild(dialog3Node);
            sourceNode.appendChild(dialog6Node);
            sourceNode.appendChild(dialog9Node);
            
            sourceNode.appendChild(shadow3Node);
            sourceNode.appendChild(shadow6Node);
            sourceNode.appendChild(shadow9Node);
            sourceNode.appendChild(shadow12Node);

            this._breadcrumbs = new Y.eZ.Breadcrumbs({
                callerID: eZFocusedOverlay.NAME,
                srcNode: "#" + dialogHeaderNode.generateID(),
                focusedNode: focusedNode,
                linkClickCallback: this._breadcrumbsLinkClickCallback,
                closeClickCallback: this._breadcrumbsCloseClickCallback
            });
            
            dialogToolBarNode.delegate('click', this._editLinkClick, '.ez-ei-focused-overlay-button-edit');
            
            Y.fire('focusedOverlay:onCreate');

        },
        
        _createToolBarNode: function (focusedNode){
            var cssPrefix = eZFocusedOverlay.CSS_PREFIX,
                dialogToolBarTemplateSource = Y.one('#ezp-nein-dialog-toolbar').getHTML(),
                dialogToolBarTemplate = Y.Handlebars.compile(dialogToolBarTemplateSource);


            dialogToolBarNode = Y.Node.create( dialogToolBarTemplate({
                cssPrefix: cssPrefix,
                dialogToolBarId: this.get("dialogToolBarId"),
                dialogClassName: cssPrefix + this.get("dialogClassNamePrefix"),
                buttons: [
                    {action: "discard", icon: "&#x0036;"},
                    {action: "edit", icon: "&#x0039;"},
                    {action: "publish", icon: "&#xe053;"}
                ]
            }));
        },
        
        /** 
         * Synchronizing overlay's divs position and/or other params
         * @method _syncFocusedOverlay
         * 
         * Special hint: nodes should BE VISIBLE during this call to be synched correctly. 
         * Otherwise positions will be calculated incorrectly.
         * 
         * Frames Nodes positions are based on focused node positions.
         * Dialog Nodes positions are based on Frame Nodes positions.
         * Shadow Nodes positions are based on Dialog Nodes positions
         * 
         */
        _syncFocusedOverlayNodes: function (focusedNode){

            // Confirming/changing overlay's target
            dialogToolBarNode.setAttribute('data-ez-focused-overlay-target-id', focusedNode.getAttribute('id'));
            Y.one('.ez-ei-focused-overlay-button-edit').setAttribute('rel', focusedNode.getAttribute('id'));

            // Neccessary vars
            var focusedX = parseInt(focusedNode.getX(),10),
                focusedY = parseInt(focusedNode.getY(),10),
                focusedWidth = focusedNode.get('offsetWidth') + 2, // adding 2 px for targeting overlay's border
                focusedHeight = focusedNode.get('offsetHeight'),

                frameDefaultWidth = this.get('frameDefaultWidth'),
                frameCountedWidth = frameDefaultWidth,
                frameNonSymmetrical = false,
                
                dialogDefaultWidth = this.get('dialogDefaultWidth'),
                dialogToolBarHeight = this.get('dialogToolBarHeight'),
                dialogHeaderHeight = this.get('dialogHeaderHeight'),
                dialogToolBarMinWidth = this.get('dialogToolBarMinWidth'),
                
                sourceX = parseInt(sourceNode.getX(),10),
                sourceY = parseInt(sourceNode.getY(),10),
                sourceWidth = parseInt(sourceNode.getComputedStyle('width'),10),
                sourceHeight = parseInt(sourceNode.getComputedStyle('height'),10),

                cssPrefix = eZFocusedOverlay.CSS_PREFIX,

                toolBarButtonsNode = Y.one('.' + cssPrefix + '-buttons'),
                languageSelectNode = Y.one('.' + cssPrefix + '-language-selector'),
                versionSelectNode = Y.one('.' + cssPrefix + '-version-selector');


            // Preserving minimum width of the toolbar
            if ((focusedWidth + 2*frameDefaultWidth + 2*dialogDefaultWidth) < dialogToolBarMinWidth){
                frameCountedWidth = parseInt((dialogToolBarMinWidth - 2*dialogDefaultWidth - focusedWidth)/2, 10);
            }
            
            // right screen edge
            if (focusedX - frameDefaultWidth - dialogDefaultWidth + dialogToolBarMinWidth > sourceX + sourceWidth){
                frameNonSymmetrical = true;
                var frameRightWidth = frameDefaultWidth,
                    frameLeftWidth = frameCountedWidth*2 - frameDefaultWidth + 1; // +1 - just in case (rounding problems)
            }
            // left screen edge
            if (focusedX - frameCountedWidth - dialogDefaultWidth < sourceX){
                frameNonSymmetrical = true;
                var frameLeftWidth = frameDefaultWidth,
                    frameRightWidth = frameCountedWidth*2 - frameDefaultWidth + 1; // +1 - just in case (rounding problems)
            }
            
            
            
            // *****            
            // Re-aligning frames (pass-partout)
                frame6Node.setXY([focusedX, focusedY + focusedHeight]);            
                frame6Node.setStyles({
                    width: focusedWidth,
                    height: frameDefaultWidth
                });
                frame12Node.setXY([focusedX, focusedY - frameDefaultWidth]);            
                frame12Node.setStyles({
                    width: focusedWidth,
                    height: frameDefaultWidth
                });
            
            if (frameNonSymmetrical){
                /// Non-symmetrical case:
                frame3Node.setXY([focusedX + focusedWidth, focusedY - frameDefaultWidth]);
                frame3Node.setStyles({
                    width: frameRightWidth,
                    height: focusedHeight + frameDefaultWidth*2 - 1
                });
                frame9Node.setXY([focusedX - frameLeftWidth, focusedY - frameDefaultWidth]);
                frame9Node.setStyles({
                    width: frameLeftWidth,
                    height: focusedHeight + frameDefaultWidth*2 - 1
                });
            }
            else {
                /// Symmetrical case:
                frame3Node.setXY([focusedX + focusedWidth, focusedY - frameDefaultWidth]);
                frame3Node.setStyles({
                    width: frameCountedWidth,
                    height: focusedHeight + frameDefaultWidth*2 - 1
                });
                frame9Node.setXY([focusedX - frameCountedWidth, focusedY - frameDefaultWidth]);
                frame9Node.setStyles({
                    width: frameCountedWidth,
                    height: focusedHeight + frameDefaultWidth*2 - 1
                });
            }
            

            // *****            
            // Re-aligning Dialog window (and Toolbar)
            dialogToolBarNode.setStyles({
                'width': frame3Node.getX() + parseInt(frame3Node.getComputedStyle('width'),10) + dialogDefaultWidth*2 - frame9Node.getX() - 2 // compensationg borders
//                'height': dialogToolBarHeight
            });

            // Positioning Toolbar buttons in 1 or 2 lines. (Before Toolbar.setXY)
            if (toolBarButtonsNode.getY() > languageSelectNode.getY()){
                toolBarButtonsNode.setStyle('paddingTop', '0px');
            }
            else{
                toolBarButtonsNode.setStyle('paddingTop', '10px');
            }

            dialogToolBarNode.setXY([frame9Node.getX() - dialogDefaultWidth, frame9Node.getY() - parseInt(dialogToolBarNode.getComputedStyle('height'),10)]);

            // Positioning Toolbar buttons in 1 or 2 lines. (After Toolbar.setXY)
            if (toolBarButtonsNode.getY() > languageSelectNode.getY()){
                toolBarButtonsNode.setX(focusedX + (focusedWidth - parseInt(toolBarButtonsNode.getComputedStyle('width'),10) )/2 );
            }
            else{
                toolBarButtonsNode.setX(focusedX +  focusedWidth - parseInt(toolBarButtonsNode.getComputedStyle('width'),10) + 5 );
            }



            dialog3Node.setXY([frame3Node.getX() + parseInt(frame3Node.getComputedStyle('width'),10), frame3Node.getY()]);
            dialog3Node.setStyles({
                width: dialogDefaultWidth - 1,
                height: parseInt(frame3Node.getComputedStyle('height'),10) + 1 // compensating passpartout border
            });
            dialog6Node.setXY([frame9Node.getX() - dialogDefaultWidth, frame6Node.getY() + parseInt(frame6Node.getComputedStyle('height'),10)]);            
            dialog6Node.setStyles({
                width: parseInt(dialogToolBarNode.getComputedStyle('width'),10),
                height: dialogDefaultWidth - 1
            });
            dialog9Node.setXY([frame9Node.getX() - dialogDefaultWidth, frame9Node.getY()]);
            dialog9Node.setStyles({
                width: dialogDefaultWidth - 1,
                height: parseInt(frame9Node.getComputedStyle('height'),10) + 1 // compensating passpartout border
            });      
            dialogHeaderNode.setXY([frame9Node.getX() - dialogDefaultWidth, dialogToolBarNode.getY() - dialogHeaderHeight - 1]);
            dialogHeaderNode.setStyles({
                width: parseInt(dialogToolBarNode.getComputedStyle('width'),10) - 5, //-5 = padding
                height: dialogHeaderHeight - 1
            });


            // *****
            // Re-aligning shadows
            shadow3Node.setXY([dialog3Node.getX(), dialogHeaderNode.getY() + dialogDefaultWidth]);            
            shadow3Node.setStyles({
                'width': dialogDefaultWidth,
                'height': dialog6Node.getY() - dialogHeaderNode.getY() - dialogDefaultWidth
            });
            shadow6Node.setXY([dialog6Node.getX(), dialog6Node.getY()]);            
            shadow6Node.setStyles({
                'width': parseInt(dialog6Node.getComputedStyle('width'),10) + 2, // compensationg borders
                'height': dialogDefaultWidth
            });
            shadow9Node.setXY([dialog9Node.getX(), dialogHeaderNode.getY() + dialogDefaultWidth]);            
            shadow9Node.setStyles({
                'width': dialogDefaultWidth,
                'height': dialog6Node.getY() - dialogHeaderNode.getY() - dialogDefaultWidth
            });
            shadow12Node.setXY([dialogHeaderNode.getX(), dialogHeaderNode.getY() ]);            
            shadow12Node.setStyles({
                'width': parseInt(dialogToolBarNode.getComputedStyle('width'),10) + 2, // compensationg borders
                'height': dialogDefaultWidth
            });


            // *****
            // Checking screen limits, and behaviour near edges
            // 

            // upper edge
            if ( dialogHeaderNode.getY() < sourceNode.getY() - this.sourceNodeYOffset ){
                
                this.sourceNodeYOffset = sourceNode.getY() - dialogHeaderNode.getY() + 2;
                    
                sourceNode.setY( sourceY + this.sourceNodeYOffset);
                sourceY = sourceY + this.sourceNodeYOffset;
                
                focusedY = focusedY + this.sourceNodeYOffset;
            }
            // right edge
            if (dialogHeaderNode.getX() - sourceX + parseInt(dialogHeaderNode.getComputedStyle('width'),10) > sourceWidth ){
                sourceWidth = dialogHeaderNode.getX()- sourceX + parseInt(dialogHeaderNode.getComputedStyle('width'),10) + 5 + 2 + 2;
            }
            

            // *****
            // Re-aligning background
            // some fussy tricks to avoid brakes in diagonal pattern

            // anti-breakage for 12
            var background12NodeWidth = focusedWidth,
                background3NodeXOffset = 0,
                remainder = background12NodeWidth % 4,
                addition = 0;
            if (remainder){
                addition = 4 - remainder;
                background12NodeWidth += addition;
                background3NodeXOffset += addition;
            }

            background12Node.setXY([focusedX, sourceY - this.sourceNodeYOffset]);
            background12Node.setStyles({
                'width': background12NodeWidth,
                'height': focusedY - sourceY - 2
            });

            background3Node.setXY([focusedX + focusedWidth + background3NodeXOffset, sourceY - this.sourceNodeYOffset]);
            background3Node.setStyles({
                'width': sourceWidth - focusedWidth - focusedX + sourceX,
                'height': sourceHeight + this.sourceNodeYOffset
            });

            // anti-breakage for 6
            var background6NodeY = focusedY + focusedHeight;
            remainder = (Math.round(background6NodeY - background3Node.getY())) % 4;
            if (remainder){
                addition = 4 - remainder;
                background6NodeY += addition + 1;
            }

            background6Node.setXY([focusedX, background6NodeY]);
            background6Node.setStyles({
                'width': background12NodeWidth,
                'height': sourceHeight - focusedHeight - focusedY + sourceY + 1
            });

            // anti-breakage for 9
            var background9NodeWidth = focusedX - sourceX,
                background9NodeX = sourceX;
            remainder = background9NodeWidth % 4;
            if (remainder) {
                addition = 4 - remainder;
                background9NodeWidth += addition;
                background9NodeX -= addition;
            }

            background9Node.setXY([background9NodeX, sourceY - this.sourceNodeYOffset]);
            background9Node.setStyles({
                'width': background9NodeWidth,
                'height': sourceHeight + this.sourceNodeYOffset
            });


            // *****
            // Finally
            this._breadcrumbs.update(focusedNode);

        },

        _showFocusedOverlayNodes: function (){
            var focusedNode = this._getFocusedOverlayTarget();
            
            if ( focusedNode ){
                var focusedOverlayNodes = Y.all('.' + eZFocusedOverlay.CSS_PREFIX);
                focusedOverlayNodes.show();
            }
        },        


        _hideFocusedOverlayNodes: function (){
            var focusedNode = this._getFocusedOverlayTarget();
            
            if ( focusedNode ){
            var focusedOverlayNodes = Y.all('.' + eZFocusedOverlay.CSS_PREFIX);
            focusedOverlayNodes.hide();
            }
        },        
        
       
        // EVENTS
        
        _breadcrumbsCloseClickCallback: function (){
            Y.fire('focusedOverlay:close');
        },
        _breadcrumbsLinkClickCallback: function (editableRegion){
            Y.fire('overlay:overlayClicked',{}, editableRegion );
        },

        _editLinkClick: function (e){
            e.preventDefault();
            Y.fire('focusedOverlay:editLinkClicked',{}, Y.one('#' + this.getAttribute('rel')));
        }



    });

    Y.eZ.FocusedOverlay = eZFocusedOverlay;

}, '0.2alpha', ['widget']);
