YUI.add('ez-structure-inspector', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.StructureInspector class
     *
     * @module ez-structure-inspector
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;

    /**
     * Widget allows inspection of the DOM tree structure (only editable regions of the page).
     *
     * @class Y.eZ.StructureInspector
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode
     */
    function eZStructureInspector(config) {
        eZStructureInspector.superclass.constructor.apply(this, arguments);
    }

    eZStructureInspector.NAME = 'structure-inspector';
    eZStructureInspector.CSS_PREFIX = "ez-ei-" + eZStructureInspector.NAME;

    eZStructureInspector.ATTRS = {

        callerID:{
            value: ""
        }

    };

    eZStructureInspector.HTML_PARSER = {
    };

    Y.extend(eZStructureInspector, Y.Widget, {

        initializer: function () {

            this.sourceNode = this.get("srcNode");

            this._createNodes();
            this._syncNodes(Y.one(null)); //'#ez-ei-editable-region-159'

            this.pageNode.delegate('click', this._pageClick ,'li' );
            this.treeNode.delegate('click', this._elementClick ,'li' );

        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {
        },

        update: function (selectedNode) {

            this._syncNodes(selectedNode);

        },

        _createNodes: function () {
            var cssPrefix = eZStructureInspector.CSS_PREFIX;

            this.headerNode = Y.Node.create(['<div class="',cssPrefix,'-header','" ></div>'].join(''));
            this.treeViewNode = Y.Node.create(['<div class="',cssPrefix,'-tree-view','" ></div>'].join(''));
            this.pageWrapperNode = Y.Node.create('<ul></ul>');
            this.pageNode = Y.Node.create( ['<li class="',cssPrefix,'-page','" ><a href="#page">Page</a></li>'].join('') );
            this.treeNode = Y.Node.create( ['<ul class="',cssPrefix,'-tree','" ></ul>'].join('') );

            this.pageWrapperNode.appendChild(this.pageNode);
            this.treeViewNode.appendChild(this.pageWrapperNode);
            this.treeViewNode.appendChild(this.treeNode);

            this.sourceNode.appendChild(this.headerNode);
            this.sourceNode.appendChild(this.treeViewNode);
        },

        _syncNodes: function (selectedNode) {

            this.headerNode.setHTML(document.title);

            this.treeNode.empty();
            this.pageNode.removeClass('selected');

            this._syncRootNodes();

            if (selectedNode) {

                var pathToRoot = new Array,
                    currentNode = selectedNode,
                    currentNodeParent = Y.one('#' + currentNode.getAttribute('data-ez-editable-region-parent')),
                    that = this,
                    currentPaddingLeft = 40;

                // Scanning DOM structure
                while (currentNodeParent){

                    pathToRoot.push(currentNodeParent);

                    currentNode = currentNodeParent;
                    currentNodeParent = Y.one('#' + currentNode.getAttribute('data-ez-editable-region-parent') );
                }

                // If needed - building whole tree structure from root to selectedNode
                if (pathToRoot){

                    currentNode = pathToRoot.pop();

                    // Parents of selected node are processed in this loop, one-by-one and in correct order
                    while(currentNode){

                        currentPaddingLeft += 20;
                        var newList = Y.Node.create('<ul></ul>'),
                            currentNodeListItem = Y.one('li[data-ez-editable-region-rel=' + currentNode.getAttribute('id') + ']'),
                            childNodes = Y.all('#' + currentNode.getAttribute('id') + ' [data-ez-editable-region-level=' + (parseInt(currentNode.getAttribute('data-ez-editable-region-level'),10)+1 ) + ']');

                        // Any affected by our path nodes should show their children
                        childNodes.each(function (childNode,index){

                            var newListItem = that._createListItemFromNode(childNode);
                            newListItem.setStyle('paddingLeft',currentPaddingLeft);
                            newListItem.setStyle('backgroundPosition', (currentPaddingLeft - 20) + 'px 8px');

                            newList.appendChild(newListItem);
                            currentNodeListItem.insert(newList,'after');

                        });

                        currentNode = pathToRoot.pop();
                    }
                }

                // Highlighting selected li
                var selectedNodeListItem = Y.one('li[data-ez-editable-region-rel=' + selectedNode.getAttribute('id') + ']');
                selectedNodeListItem.addClass('selected');

                // If container selected
                if (selectedNodeListItem.hasClass('items-container')) {

                    //Show container contents
                    currentPaddingLeft += 20;
                    childNodes = Y.all('#' + selectedNode.getAttribute('id') + ' [data-ez-editable-region-level=' + (parseInt(selectedNode.getAttribute('data-ez-editable-region-level'),10)+1 ) + ']');
                    var newList = Y.Node.create('<ul></ul>');

                    childNodes.each(function (childNode,index){
                        var newListItem = that._createListItemFromNode(childNode);
                        newListItem.setStyle('paddingLeft',currentPaddingLeft);
                        newListItem.setStyle('backgroundPosition', (currentPaddingLeft - 20) + 'px 8px');
                        newListItem.addClass('editable');

                        newList.appendChild(newListItem);
                        selectedNodeListItem.insert(newList,'after');
                    });
                }
            }
            else {
                // no nodes selected, highlighting all root nodes, and selecting page node
                var treeRootNodes = this.treeNode.get('children');
                treeRootNodes.addClass('editable');

                this.pageNode.addClass('selected');
            }

        },

        _syncRootNodes: function () {

            var rootNodes = Y.all('[data-ez-editable-region="true"][data-ez-editable-region-level=1]'),
                that = this;

            if (!rootNodes.isEmpty() ){
                rootNodes.each(function (rootNode,index){

                    // controlling markers indexing
                    if (!rootNode.hasAttribute('data-ez-editable-region-marker')) {
                        rootNode.setAttribute('data-ez-editable-region-marker', (index + 1) );
                    }

                    // creating tree branch node
                    var branchNode = that._createListItemFromNode(rootNode);

                    that.treeNode.appendChild( branchNode );
                });
            }
        },

        _createListItemFromNode: function (targetNode){
            var listItem = Y.Node.create( [     '<li data-ez-editable-region-rel="',targetNode.getAttribute('id'),'">',
                                                    '<a href="#inspect" rel="',targetNode.getAttribute('id'),'">',
                                                        targetNode.getAttribute('data-ez-editable-region-marker'),' <span>',targetNode.getAttribute('data-ez-field-identifier'),'</span>',
                                                    '</a>',
                                                '</li>'].join('') );

            // node type
            if (!targetNode.hasAttribute('data-ez-field-type-identifier')){
                listItem.addClass('items-container');
            }
            else {
                switch(targetNode.getAttribute('data-ez-field-type-identifier')){
                    case 'ezstring':
                        listItem.addClass('item-text');
                        break;
                    case 'eztext':
                        listItem.addClass('item-text');
                        break;
                    case 'ezimage':
                        listItem.addClass('item-image');
                        break;
                    case 'ezsomethingorother':
                        listItem.addClass('item-invisible');
                        break;
                }
            }

            return listItem;
        },

        /// EVENTS
        _pageClick: function (e){
            e.preventDefault();
            Y.fire('structureInspector:pageClicked');
        },

        _elementClick: function (e){
            e.preventDefault();
            Y.fire('overlay:overlayClicked',{}, Y.one('#' + this.getAttribute('data-ez-editable-region-rel')) );
        }

    });

    Y.eZ.StructureInspector = eZStructureInspector;

}, '0.1alpha', ['widget','node']);
