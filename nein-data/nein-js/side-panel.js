// TODO: case of 2 panels
// TODO: strange behaviour in FE mode
YUI.add('ez-side-panel', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.SidePanel class
     *
     * @module ez-dropdown
     */

    Y.namespace('eZ');

    var Lang = Y.Lang

    /**
     * 
     * 
     *
     * @class Y.eZ.SidePanel
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    function eZSidePanel(config) {
        eZSidePanel.superclass.constructor.apply(this, arguments);
    }

    eZSidePanel.NAME = 'side-panel';
    eZSidePanel.CSS_PREFIX = "ez-ei-" + eZSidePanel.NAME;

    eZSidePanel.ATTRS = {
        triggerClassName:{
            value:'-trigger'
        },
        contentClassName:{
            value:'-content'
        },
        separatorClassName:{
            value:'-drag-separator'
        },
        
        sideMargin:{
            value:10
        },
        minWidth:{
            value:20
        },
        openingWidth:{
            value:300
        },
        
        mode:{
            value:'left'
        }
    };

    eZSidePanel.HTML_PARSER = {
    };

    Y.extend(eZSidePanel, Y.Widget, {
        initializer: function () {
            
            this.eventClicked = false;
            this.eventDragged = false;
            
            this.sideMargin = this.get("sideMargin");
            this.minWidth = this.get("minWidth");
            
            this.sourceNode = this.get("srcNode");
            this.htmlNode = Y.one('html.ezp-user-logged-in');
            this.separatorNode = Y.one('#' + this.sourceNode.generateID() + ' .' + eZSidePanel.CSS_PREFIX + this.get("separatorClassName"));

            this.mode = this.get("mode");

            this.contentNode = Y.one('#' + this.sourceNode.generateID() + ' .' + eZSidePanel.CSS_PREFIX + this.get("contentClassName"));
            this.contentNode.hide();
            
            this.triggerNode = Y.one('#' + this.sourceNode.generateID() + ' .' + eZSidePanel.CSS_PREFIX + this.get("triggerClassName"));
            this.triggerNode.on('mousedown', this._onMouseDown, this);
            this.separatorNode.on('mousedown', this._onMouseDown, this);
            
            
            this._syncNodes();
        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {
        },

        appear: function () {

            if ( this.mode == 'left'){

                this.sourceNode.setStyle('left',-25);
                this.sourceNode.setStyle('visibility','visible');
                this.sourceNode.transition({
                    left:{
                        delay:0.5,
                        duration:0.5,
                        value:0
                    }
                });
                this.sourceNode.setStyle('left',0);

            }
            else{
                this.sourceNode.setStyle('right',-25);
                this.sourceNode.setStyle('visibility','visible');
                this.sourceNode.transition({
                    right:{
                        delay:0.5,
                        duration:0.5,
                        value:0
                    }
                });
                this.sourceNode.setStyle('right',0);
            }

            this._syncNodes();
        },

        disappear: function () {

            this.move(-(parseInt(this.sourceNode.getComputedStyle('width'),10)));
            this.sourceNode.setStyle('visibility','hidden');

        },

        move: function (deltaWidth) {

            var sourceWidth = parseInt(this.sourceNode.getComputedStyle('width'),10),
                newWidth = sourceWidth + deltaWidth;
            
            // maintaining min width
            if (newWidth < this.minWidth) {
                this.hideContent();
                newWidth = this.minWidth;
            }
            
            // showing content if needed
            if (newWidth > this.minWidth && !this.contentNode.hasClass("opened")){
                this.showContent();
            }
            
            // the move itself
            if (this.mode == 'left'){
                this.htmlNode.setStyles({
                    'marginLeft' : newWidth + this.sideMargin
                });
            }
            else{
                this.htmlNode.setStyles({
                    'marginRight' : newWidth + this.sideMargin
                });
            }
                
            this.sourceNode.setStyles({
                'width': newWidth
            });
            
            this._syncNodes();
            Y.fire('sidePanel:move');

            
        },

        showContent : function () {
            this.contentNode.show();
            this.contentNode.setStyles({"display":"block"});
            this.contentNode.addClass("opened");
            this.sourceNode.addClass("opened");
        },

        hideContent: function () {

            this.contentNode.hide();
            this.contentNode.removeClass("opened");
            this.sourceNode.removeClass("opened");
        },
        
        syncPanel: function () {
            this._syncNodes();
        },
        
        _syncNodes: function () {
            
            var triggerX, separatorX;
            if (this.mode == 'left'){
                triggerX = this.sourceNode.getX() + parseInt(this.sourceNode.getComputedStyle('width'),10) - parseInt(this.triggerNode.getComputedStyle('width'),10);
                separatorX = this.sourceNode.getX() + parseInt(this.sourceNode.getComputedStyle('width'),10);
            }
            else{
                triggerX = this.sourceNode.getX();
                separatorX = this.sourceNode.getX() - parseInt(this.separatorNode.getComputedStyle('width'),10);
            }
            this.triggerNode.setXY([triggerX,
                                    this.sourceNode.getY() + (parseInt(this.sourceNode.getComputedStyle('height'),10) - parseInt(this.triggerNode.getComputedStyle('height'),10))/2 ]);

            this.separatorNode.setXY([separatorX, this.sourceNode.getY()]);
        },

        _onMouseDown: function (e) {
            
            e.preventDefault();
            
            this.eventClicked = true;
            if (e._event.pageX) {
                this.pageX = e._event.pageX;
            } else {
                this.pageX = e._event.clientX;
            }

            
            this.htmlNode.on('mousemove', this._panelDrag, this);
            this.htmlNode.on('mouseup', this._onMouseUp, this);
            this.htmlNode.on('mouseleave', this._onMouseUp, this);

        },


        _onMouseUp: function (e) {

            this.eventClicked = false;

            if (this.eventDragged){
                // manual resizing finish
                this.eventDragged = false;
            }
            else {
                if (e.target == this.triggerNode) {
                    // single click on handler - opening for preset width, or closing alltogether
                    if (this.contentNode.hasClass("opened")){
                        this.move(-parseInt(this.sourceNode.getComputedStyle('width'),10));
                        this.hideContent();
                    }
                    else {
                        this.showContent();
                        this.move(this.get("openingWidth"));
                    }
                }
            }
            
            this.htmlNode.detach('mousemove', this._panelDrag);
            this.htmlNode.detach('mouseup', this._triggerMouseUp);
            this.htmlNode.detach('mouseleave', this._triggerMouseUp);            

            
        },

        _panelDrag: function (e) {
            
            if (this.eventClicked) {
                this.eventDragged = true;

                var newX = 0;

                if (e._event.pageX) {
                    newX = e._event.pageX;
                } else {
                    newX = e._event.clientX;
                }

                var deltaX = newX - this.pageX;
                this.pageX = newX;
                
                if (this.mode == 'right'){
                    deltaX = -deltaX;
                }
                    

                this.move(deltaX);
            }

        },
        
        _onMouseLeave: function (e) {

            this.eventClicked = false;
            this.eventDragged = false;
            
            this.htmlNode.detach('mousemove', this._panelDrag);
            this.htmlNode.detach('mouseup', this._triggerMouseUp);
            this.htmlNode.detach('mouseleave', this._triggerMouseUp);             
        }

        
    });

    Y.eZ.SidePanel = eZSidePanel;

}, '0.1alpha', ['widget']);
