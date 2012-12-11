//TODO: width is not correct sometimes on the very first run.
YUI.add('ez-form-editor', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.FormEditor
     *
     * @module ez-form-editor
     */

    Y.namespace('eZ');
    
    var Lang = Y.Lang,
        sourceNode,
        topNavigationNode,
        dialogHeaderNode,
        dialogToolBarNode,
        dialogContentNode,
        wrapperNode,
        formTextFieldTemplate,
        formImageFieldTemplate,
        formTextareaFieldTemplate,
        formPlugFieldTemplate,
        formMenuFieldTemplate;
        
    /**
     * First simplest implementation of form editor
     *
     *
     * @class Y.eZ.FormEditor
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    
    function eZFormEditor(config) {
        eZFormEditor.superclass.constructor.apply(this, arguments);
    }

    eZFormEditor.NAME = 'form-editor';
    eZFormEditor.CSS_PREFIX = "ez-ei-" + eZFormEditor.NAME;

    eZFormEditor.ATTRS = {

        topNavigationClassName:{
            value: '-top-navigation'
        },
        dialogClassName:{
            value: '-dialog'
        },
        dialogContentClassName:{
            value: '-dialog-content'
        },
        markerClassName:{
            value: '-marker'
        },
        wrapperClassName:{
            value: '-wrapper'
        },
        
        dialogToolBarId:{
            value: '-toolbar'
        },

        dialogHeaderId:{
            value: '-header'
        },
        dialogHeaderHeight:{
            value: 31
        }
    };

    eZFormEditor.HTML_PARSER = {
    };

    Y.extend(eZFormEditor, Y.Widget, {
        initializer: function () {
            sourceNode = this.get('srcNode');

            //preparing and compiling templates for the form fields
            formTextFieldTemplate       = Y.Handlebars.compile(Y.one('#ezp-nein-form-text-field').getHTML());
            formImageFieldTemplate      = Y.Handlebars.compile(Y.one('#ezp-nein-form-image-field').getHTML());
            formTextareaFieldTemplate   = Y.Handlebars.compile(Y.one('#ezp-nein-form-textarea-field').getHTML());
            formPlugFieldTemplate       = Y.Handlebars.compile(Y.one('#ezp-nein-form-plug-field').getHTML());

        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {

        },
        
        showFormEditor: function (focusedNode){
            
            Y.one('.ez-ei-header').hide();
            Y.one('.ez-ei-content-wrapper').hide();
            Y.one('.ez-ei-linear').hide();
            Y.one('.ez-ei-working-bench').addClass('form-editor-mode');


            if (focusedNode){

                if ( !this._getFormEditorTarget() ){
                    this._createFormEditorNodes(focusedNode);
                    this._syncFormEditorNodes(focusedNode);
                }
                else{
                    this._showFormEditorNodes();
                    this._syncFormEditorNodes(focusedNode);
                }
                
                this.flagVisible = true;
                
            }

        },
        
        syncFormEditor: function (){
            var focusedNode = this._getFormEditorTarget();
            
            if ( focusedNode && this.flagVisible ){
                this._syncFormEditorNodes(focusedNode);
                console.log( 'FE sync');
            }
            
        },
        
        hideFormEditor: function(){
            
            this._hideFormEditorNodes();
            this.flagVisible = false;
            
            Y.one('.ez-ei-header').show();
            Y.one('.ez-ei-content-wrapper').show(); 
            Y.one('.ez-ei-linear').show();
            Y.one('.ez-ei-working-bench').removeClass('form-editor-mode');
        },

        /**
         * Checking form editor existance, and target
         * @method _syncFormEditor
         */
        _getFormEditorTarget: function (){
            
            if (dialogToolBarNode){
                return Y.one('#' + dialogToolBarNode.getAttribute('data-ez-form-editor-target-id'));                
            }
            else{
                return false;
            }
        },


        /** 
         * Creating all divs neccessary for the form editor
         * @method _syncFormEditor
         */
        _createFormEditorNodes: function (focusedNode){
            var cssPrefix = eZFormEditor.CSS_PREFIX,

                topNavigationClassName = cssPrefix + this.get("topNavigationClassName"),
                dialogContentClassName = cssPrefix + this.get("dialogContentClassName"),
                wrapperClassName = cssPrefix + this.get("wrapperClassName");
            
            topNavigationNode = Y.Node.create(['<div id="',topNavigationClassName,'" class="',cssPrefix,'"><ul><li><span data-icon="&#x0034;"></span><a href="#return" id="',topNavigationClassName,'-return','">Return to preview</a></li></ul></div>'].join(''));

            dialogHeaderNode = Y.Node.create([  '<div id="',cssPrefix + this.get("dialogHeaderId"),'" class="',cssPrefix,'">','</div>'].join(''));

            this._createToolBarNode();
            dialogToolBarNode.setAttribute('data-ez-form-editor-target-id', focusedNode.getAttribute('id'));
                
            dialogContentNode = Y.Node.create(['<div class="',dialogContentClassName,' ',cssPrefix,'" ></div>'].join(''));
            
            
            dialogToolBarNode.appendChild(dialogContentNode);
            
            sourceNode.appendChild(dialogHeaderNode);
            sourceNode.appendChild(dialogToolBarNode);
            
            sourceNode.appendChild(topNavigationNode);            

            this._breadcrumbs = new Y.eZ.Breadcrumbs({
                callerID: eZFormEditor.NAME,
                srcNode: "#" + dialogHeaderNode.generateID(),
                focusedNode: focusedNode,
                linkClickCallback: this._breadcrumbsLinkClickCallback,
                closeClickCallback: this._breadcrumbsCloseClickCallback
            });

            // saving content
            dialogToolBarNode.delegate('click', this._publishLinkClick, '.' + cssPrefix + '-button-publish', this);

            // dismissal events
            dialogToolBarNode.delegate('click', this._closeLinkClick, '.' + cssPrefix + '-button-discard');
            topNavigationNode.delegate('click', this._topNavigationReturnClick ,'#' + cssPrefix + this.get("topNavigationClassName") + '-return');
            
            // marker navigation
            dialogContentNode.delegate('click', this._markerClick ,'.' + cssPrefix + this.get("markerClassName") );
            
            // content events
            dialogContentNode.delegate('click', this._imageFileSelectClick ,'.image-file-select-button' );
            
            Y.fire('formEditor:onCreate');

        },
        
        _createToolBarNode: function (){
            var cssPrefix = eZFormEditor.CSS_PREFIX,
                dialogToolBarTemplateSource = Y.one('#ezp-nein-dialog-toolbar').getHTML(),
                dialogToolBarTemplate = Y.Handlebars.compile(dialogToolBarTemplateSource);
                
            dialogToolBarNode = Y.Node.create( dialogToolBarTemplate({
                cssPrefix: cssPrefix,
                dialogToolBarId: this.get("dialogToolBarId"),
                dialogClassName: cssPrefix + this.get("dialogClassName"),
                buttons: [
                    {action: "discard", icon: "&#x0036;"},
                    {action: "publish", icon: "&#xe064;"}
                ]
            }));
        },
        
        /** 
         * Synchronizing editor's divs position and/or other params
         * @method _syncFormEditor
         * 
         * Special hint: nodes should BE VISIBLE during this call to be synched correctly. 
         * Otherwise positions may be calculated incorrectly.
         * 
         */
        _syncFormEditorNodes: function (focusedNode){

            // Confirming/changing editor's target
            dialogToolBarNode.setAttribute('data-ez-form-editor-target-id', focusedNode.getAttribute('id'));

            this._refillDialogContent(); // this procedure affects source width for some reason, so should be called early

            // 
            topNavigationNode.setXY([sourceNode.getX() - 10, sourceNode.getY() - 47]);
            

            // Neccessary vars
            var sourceWidth = parseInt(sourceNode.getComputedStyle('width'),10),
                contentWidth = sourceWidth, 
                dialogHeaderHeight = this.get('dialogHeaderHeight');
                
            
            dialogHeaderNode.setStyles({
                'width' : contentWidth - 5, //padding
                'height': dialogHeaderHeight - 2 //padding
            });

            dialogToolBarNode.setStyles({
                'width' : contentWidth
                
            });
            
            dialogContentNode.setStyles({
                'width' : contentWidth - 12 //padding
            });


            this._breadcrumbs.update(focusedNode);

            this._setFocus();
        },
        
        
        /**
         * Updates dialog content with up-to-date forms data, taking into account current target of Form Editor.
         * @method _refillDialogContent
         *               
         * Branch Node - container editable node - includes other nodes which can be actually edited. Marked by "blocks" marker.
         * 
         * Leaf Node - node which doesn't include other nodes - should be actually edited. Marked by image or pen or whatever...
         * 
        */
        _refillDialogContent: function (){
            var cssPrefix = eZFormEditor.CSS_PREFIX,
                markerClassName = cssPrefix + this.get("markerClassName");
            
            dialogContentNode.empty();
            
            var targetNode = this._getFormEditorTarget(),
                that = this,
                singleNode = false;
                
                
            if (targetNode.hasAttribute("data-ez-field-type-identifier")) {
                // Leaf Node
                editableNodes = Y.all('#' + targetNode.getAttribute('id'));
                singleNode = true;
            }
            else {
                // Branch Node
            var editableLevel = parseInt(targetNode.getAttribute('data-ez-editable-region-level'),10) + 1,
                editableNodes = Y.all('#' + targetNode.getAttribute('id') + ' ' + '[data-ez-editable-region-level="'+ editableLevel + '"]');
            }
                
            if (!editableNodes.isEmpty() ){
                editableNodes.each(function(editableNode, index){
                    
                    //controlling markers indexing
                    if (!editableNode.hasAttribute('data-ez-editable-region-marker')) {
                        var parentMarker = Y.one('#' + editableNode.getAttribute('data-ez-editable-region-parent')).getAttribute('data-ez-editable-region-marker'),
                            newMarker = parentMarker + '.' + (index + 1);
                        editableNode.setAttribute('data-ez-editable-region-marker', newMarker);
                    }                    
                    
                    //
                    var editableNodeChildren = Y.all('#' + editableNode.getAttribute('id') + ' ' + '[data-ez-field-type-identifier]'),

                        newContentGroup = dialogContentNode.appendChild(Y.Node.create('<div class="ez-ei-from-editor-dialog-content-group"></div>')),
                        markerNode = Y.Node.create(['<div class="',markerClassName,'" rel="',editableNode.getAttribute("id"),'">',editableNode.getAttribute("data-ez-editable-region-marker"),'</div>'].join(''));
                        markerNode.addClass('ez-ei-overlay-marker-blocks');
                        newContentGroup.appendChild(markerNode);

                    if (!editableNodeChildren.isEmpty() ){ 
                        // Tree branch node with leaves
                        editableNodeChildren.each(function(editableNodeChild){
                            newContentGroup.appendChild(that._processLeafNode2ContentModule(editableNodeChild, false, null));
                        });
                    }
                    else { 
                        // Leaf node
                        newContentGroup.appendChild(that._processLeafNode2ContentModule(editableNode, true, markerNode));
                    }

                });
            }
            else {
                dialogContentNode.appendChild(Y.Node.create('<div style="text-align:center">' + '<strong>No regions to edit!</strong>' + '</div>'));
            }
            
            // attaching widgets to all expandable fields
            // it must be done only when nodes are in DOM
            var expandableWidgetNodes = Y.all(".ez-ei-expandable-widget");
            expandableWidgetNodes.each(function(expandableWidgetNode){
                new Y.eZ.Expandable({srcNode: "#" + expandableWidgetNode.generateID()});
            });


            // embedding TinyMCE
            // it must be done only when nodes are in DOM
            var textAreas = dialogContentNode.all('textarea');
            textAreas.each(function(textArea){
                tinyMCE.execCommand('mceAddControl', true, textArea.getAttribute("id"));            
            });
            
            // removing cursor:pointer for last level markers
            if (singleNode){
                Y.one('.ez-ei-form-editor-marker').setStyles({
                    'cursor':'default'
                });
            }
            
        },


        /**
         * Converts any given leaf into form element (content module) and returns it
         * @method _processLeafNode2ContentModule
         *               
         * Branch Node - container editable node - includes other nodes which can be actually edited. Marked by "blocks" marker.
         * 
         * Leaf Node - node which doesn't include other nodes - should be actually edited. Marked by image or pen or whatever...
         * 
        */
        _processLeafNode2ContentModule: function (leafNode, changeMarker, markerNode){
            var newContentModule = Y.Node.create('<div class="ez-ei-from-editor-dialog-content-module"></div>');

            newContentModule.setAttribute('data-ez-ei-form-editor-module-target',leafNode.getAttribute("id"));

            //Field type switching:
            //Text
            if (leafNode.getAttribute('data-ez-field-type-identifier') == 'ezstring' ){
                newContentModule.append(formTextFieldTemplate({
                    label: leafNode.getAttribute('data-ez-field-identifier'),
                    value: Y.Lang.trim(leafNode.getHTML())
                }));
                if (changeMarker) {
                    markerNode.removeClass('ez-ei-overlay-marker-blocks');
                    markerNode.addClass('ez-ei-overlay-marker-text');
                }
                
            }
            // Commented because we are not sure yet, what to do with "shorttext" field type - no analog in eZPublish field types.
            //Short text
//            if (leafNode.getAttribute('data-ez-field-type-identifier') == 'shortext' ){
//                newContentModule.append([   '<div class="content-label"><label>',leafNode.getAttribute('data-ez-field-identifier'),':</label></div>',
//                                            '<div class="content-input"><input class="ez-ei-form-editor-focusable" type="text" value="',Y.Lang.trim(leafNode.getHTML()),'" /></div>'].join('') );
//                newContentModule.addClass('short');
//                if (changeMarker) {
//                    markerNode.removeClass('ez-ei-overlay-marker-blocks');
//                    markerNode.addClass('ez-ei-overlay-marker-text');
//                }
//            }
            //Image
            if (leafNode.getAttribute('data-ez-field-type-identifier') == 'ezimage' ){
                var imageSource = leafNode.getAttribute("src");
                newContentModule.append(formImageFieldTemplate({
                    label: leafNode.getAttribute('data-ez-field-identifier'),
                    imageSource: imageSource,
                    selectFileName: imageSource.replace(/^.*[\\\/]/, ''),
                    selectFileIcon: "&#x003b;"
                }));
                if (changeMarker) {
                    markerNode.removeClass('ez-ei-overlay-marker-blocks');
                    markerNode.addClass('ez-ei-overlay-marker-image');
                }
            }
            //Textarea
            if (leafNode.getAttribute('data-ez-field-type-identifier') == 'eztext' ){
                newContentModule.append(formTextareaFieldTemplate({
                    label: leafNode.getAttribute('data-ez-field-identifier'),
                    value: Y.Lang.trim(leafNode.getHTML())
                }));
                if (changeMarker) {
                    markerNode.removeClass('ez-ei-overlay-marker-blocks');
                    markerNode.addClass('ez-ei-overlay-marker-text');
                }
                newContentModule.one('textarea').generateID();
            }

            //Menu (Selection?)
            if ((leafNode.getAttribute('data-ez-field-type-identifier') == 'ezselection' ) || (leafNode.getAttribute('data-ez-field-type-identifier') == 'ezobjectrelationlist')) {
                newContentModule.append(formPlugFieldTemplate({
                    label: leafNode.getAttribute('data-ez-field-identifier'),
                    value: 'Sorry, no interface for "Object relation list" and "Selection" field types yet.'
                }));
                if (changeMarker) {
                    markerNode.removeClass('ez-ei-overlay-marker-blocks');
                    markerNode.addClass('ez-ei-overlay-marker-list');
                }
            }


            // For all the fields:
            // "disabled" check
            if (leafNode.hasAttribute('data-ez-editable-region-disabled')) {
                newContentModule.all('input').setAttribute('disabled', 'disabled');
                newContentModule.all('input').removeClass('ez-ei-form-editor-focusable');
                newContentModule.all('label').addClass('disabled');
                
            }
            
            // expandable attributes
            if (leafNode.hasAttribute('data-ez-editable-region-expandable-attributes')) {
                var attributesJSON = JSON.parse(leafNode.getAttribute('data-ez-editable-region-expandable-attributes'));
                
                for (var attribute in attributesJSON){
                    var expandableWidgetNode = Y.Node.create(['<div class="ez-ei-expandable-widget"><div class="ez-ei-expandable-header">',attribute,'</div><div class="ez-ei-expandable-content">',attributesJSON[attribute],'</div></div>'].join(''));
                    newContentModule.one('.content-input').appendChild(expandableWidgetNode);
                    
                }
            }
            
            return newContentModule;
        },

        /**
         * Setting focus on first selectable input of previously generated form.
         * @method _setFocus
         *
         * We are using it instead of "autofocus" HTML5 tag, because
         * a) this tag is not supported by IE
         * b) it will not work with tinyMCE
         */
        _setFocus: function (){
            var firstSelectableInput = dialogContentNode.one('.ez-ei-form-editor-focusable');
            
            if (firstSelectableInput){
                firstSelectableInput.focus();
                
                if (firstSelectableInput.hasClass('textarea')){
                    tinyMCE.execCommand('mceFocus', false, firstSelectableInput.getAttribute("id"));
                }
            }
        },

        _showFormEditorNodes: function (){
            var focusedNode = this._getFormEditorTarget();
            
            if ( focusedNode ){
                var formEditorNodes = Y.all('.' + eZFormEditor.CSS_PREFIX);
                formEditorNodes.show();
            }
        },        


        _hideFormEditorNodes: function (){
            var focusedNode = this._getFormEditorTarget();
            
            if ( focusedNode ){
            var formEditorNodes = Y.all('.' + eZFormEditor.CSS_PREFIX);
            formEditorNodes.hide();
            }
        },        
        
       
        // EVENTS

        _breadcrumbsLinkClickCallback: function (focusedNode){
            Y.fire('formEditor:overlayClicked',{}, focusedNode );
        },
        _breadcrumbsCloseClickCallback: function (){
            Y.fire('formEditor:close');
        },

        _markerClick: function (e){
            e.preventDefault();
            Y.fire('formEditor:overlayClicked',{}, Y.one('#' + this.getAttribute('rel')) );
        },

        _publishLinkClick: function (e){
            e.preventDefault();

            // basic saving of static content (TEMPORARY)
            var contentNodes = dialogContentNode.get('children');
            contentNodes.each(function(contentNode){
                var contentModule = Y.one('#' + contentNode.generateID() + ' .ez-ei-from-editor-dialog-content-module');
                var realNode = Y.one('#' + contentModule.getAttribute('data-ez-ei-form-editor-module-target'));
                var inputNode = Y.one('#' + contentNode.generateID() + ' .content-input');

                //ezstring
                if (inputNode.hasClass('ezstring')) {

                    realNode.setHTML(Y.one('#' + inputNode.generateID() + ' input[type="text"]').get('value'));
                }

                //eztext
                if (inputNode.hasClass('eztext')) {
                    var textAreaNode = Y.one('#' + inputNode.generateID() + ' textarea');
                    realNode.setHTML( tinyMCE.get( textAreaNode.generateID() ).getContent() );
                }

                //ezimage
                if (inputNode.hasClass('ezimage')) {
                    // hmmm...
                }

            });




            Y.log('Content saved!');
            Y.fire('formEditor:close');
        },

        _closeLinkClick: function (e){
            e.preventDefault();
            Y.fire('formEditor:close');
        },
        _topNavigationReturnClick: function (e){
            e.preventDefault();
            Y.fire('formEditor:topNavigationReturn',{}, Y.one('#' + dialogToolBarNode.getAttribute('data-ez-form-editor-target-id')) );
        },

        _imageFileSelectClick: function (e){
            alert('Select picture');
        }
        
    });

    Y.eZ.FormEditor = eZFormEditor;

}, '0.2alpha', ['widget']);
