YUI.add('ez-assets-manager', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.AssetsManager class
     *
     * @module ez-assets-manager
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;

    /**
     * Widget for uploading and managing media assets.
     *
     * @class Y.eZ.AssetsManager
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode
     */
    function eZAssetsManager(config) {
        eZAssetsManager.superclass.constructor.apply(this, arguments);
    }

    eZAssetsManager.NAME = 'structure-inspector';
    eZAssetsManager.CSS_PREFIX = "ez-ei-" + eZAssetsManager.NAME;

    eZAssetsManager.ATTRS = {

    };

    eZAssetsManager.HTML_PARSER = {
    };

    Y.extend(eZAssetsManager, Y.Widget, {

        initializer: function () {

            this.sourceNode = this.get("srcNode");
            this.uploaderNode = Y.one("#ez-ei-media-uploader");
            this.dropAreaNode = Y.one(".ez-ei-media-drop-area");
            this.progressIndicatorNode = Y.one(".ez-ei-media-progress-indicator");
            this.filesListNode = Y.one(".ez-ei-media-area-files-list");
            this.dialogNode = Y.one(".ez-ei-media-upload-dialog");

            this.sidePanelContent = Y.one("#ez-ei-side-panel-right .ez-ei-side-panel-content");

            this.fileInputNode = Y.one("#ez-ei-media-drop-file-browse");
            this.iFrameNode = Y.one("#ez-ei-media-uploader-iframe");

            this.progressNumFilesLeft = Y.one(".ez-ei-media-progress-num-files-left");
            this.progressNumFilesDone = Y.one(".ez-ei-media-progress-num-files-done");

            this.dialogNode.hide();
            this.progressIndicatorNode.hide();

            this.filesList = [];
            this.rejectedFilesList = [];

            this.allowedFileTypeArray = ["image/png","image/jpeg","image/gif","image/tiff","video/flv","video/mpg","video/x-msvideo","application/pdf", "application/doc"];
            this.allowedFileMaxSize = 30000000;

            this._progressBar = new Y.eZ.ProgressBar({
                srcNode: ".ez-ei-media-progress-indicator"
            });
            this.progressBarNode = Y.one(".ez-ei-media-progress-bar-background");

            // determining if browser supports fileAPI. Allowing drag-n-drop in that case
            // TODO: make more precise determination (fileAPI vs. Drag-n-drop)
            // Or may be let it be that way, since for modern browsers it's irrelevant.
            if (!!window.FileReader) {
                this.dropAreaNode.on('dragover', this._dropAreaDragOver, this);
                this.dropAreaNode.on('dragenter', this._dropAreaDragEnter, this);
                this.dropAreaNode.on('dragleave', this._dropAreaDragLeave, this);
                this.dropAreaNode.on('drop', this._dropAreaDrop, this);
            }

            this.dropAreaNode.delegate('click', this._dropAreaClick,'div');

            this.fileInputNode.on('change', this._fileSelected, this);
            this.iFrameNode.on('load', this._iFrameFileLoaded, this);

            this.filesListNode.delegate('click', this._fileListDeleteClick, 'li a', this);

            this.dialogNode.delegate('click', this._uploadButtonClick, '.ez-ei-media-upload-dialog-button-upload', this);
            this.dialogNode.delegate('click', this._closeUploadDialog, '.ez-ei-media-upload-dialog-button-cancel', this)

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

        update: function () {

            this._syncNodes();

        },

        _syncNodes: function () {

            this.filesListNode.empty();
            var that = this;

            if (this.filesList.length || this.rejectedFilesList.length) {

                Y.Array.forEach(this.filesList, function(file, index){
                    that.filesListNode.prepend( ['<li data-file-index="', index, '">',
                                                    file.name, ' ', that._getReadableFileSizeString(file.size),
                                                    '<a href="#delete" ></a>',
                                                '</li>'].join('') );
                });

                if (this.rejectedFilesList.length) {

                    that.filesListNode.append( '<li class="rejected-header">---------  can not be uploaded  ---------</li>' );

                    Y.Array.forEach(this.rejectedFilesList, function(file){
                        that.filesListNode.append( ['<li class="rejected">',
                            file.name, ' ', that._getReadableFileSizeString(file.size),
                            '<a></a>',
                            '</li>'].join('') );
                    });
                }
            }


            // TODO: make this style change more nice...
            this.sidePanelContent.setStyle('bottom', parseInt(this.uploaderNode.getComputedStyle('height'),10) + 40 );

        },

        _addFileToList: function (file){

            // if file is unique?
//            if (Y.Array.grep(this.filesList, function(e){ return e.name == file.name;}).length == 0){
            if ( this._fileNameIsUnique(file.name) ){
                // does file extension is ok?
                if (this.allowedFileTypeArray.indexOf(file.type) != -1){
                    // does file size is ok?
                    if (file.size < this.allowedFileMaxSize){

                        // file is OK! adding it to the List finally
                        this.filesList.push(file);

                    } else {
                        //file is rejected by size
                        Y.log('ignoring by size ' + file.name);
                        if ( this._rejectedFileNameIsUnique(file.name) ){
                            this.rejectedFilesList.push(file);
                        }
                    }
                } else {
                    // file is rejected by type
                    Y.log('ignoring by type ' + file.type);
                    if ( this._rejectedFileNameIsUnique(file.name) ){
                        this.rejectedFilesList.push(file);
                    }
                }
            } else {
                // file is rejected as a duplicate
                Y.log('ignoring duplicate file ' + file.name);
            }
        },

        _removeFileFromList: function (index, callback){

            var fileListItem = Y.one('.ez-ei-media-area-files-list li[data-file-index="' + index + '"]'),
                that = this;

            fileListItem.transition({
                    opacity: {
                        duration: 0.5,
                        value: 0
                    }
                },
                function (){
                    that.filesList.splice(index, 1);
                    that._syncNodes();
                    if (callback) {
                        callback();
                    }
                }
            );
        },

        _removeRemainingItemsFromList: function (callback){
            var remainingListItems = Y.all('.ez-ei-media-area-files-list li'),
                that = this;
            remainingListItems.transition({
                    opacity: {
                        duration: 0.5,
                        value: 0
                    }
                },
                function (){
                    that.filesList = [];
                    that.rejectedFilesList = [];
                    that._syncNodes();
                    if (callback) {
                        callback();
                    }
                }
            );
        },

        // Y.Array.grep is not working for some reason (js crushes after single run of grep)
        // We are using stupid search instead - for a time being...
        _fileNameIsUnique: function (fileName){
            for (var i = 0; i < this.filesList.length; i++) {
                if (this.filesList[i].name === fileName) {
                    return false;
                }
            }
            return true;
        },
        _rejectedFileNameIsUnique: function (fileName){
            for (var i = 0; i < this.rejectedFilesList.length; i++) {
                if (this.rejectedFilesList[i].name === fileName) {
                    return false;
                }
            }
            return true;
        },


        _openUploadDialog: function (filesToUpload){

            var that = this;

            this.dialogNode.show();
            this.uploaderNode.addClass('uploading');

            // filling-up files list
            Y.Array.forEach(filesToUpload, function (file){
                that._addFileToList(file);
            });

            this._syncNodes();
        },
        _closeUploadDialog: function (e){
            if (e) {
                e.preventDefault();
            }

            var that = this;
            this._removeRemainingItemsFromList(function () {that.uploaderNode.removeClass('uploading');});
            this.dialogNode.hide();
            this.progressIndicatorNode.hide();
            this.dropAreaNode.show();
        },

        // TODO: REF - make sure NOTHING will affect this.filesList during upload process - flags?
        _uploadStart: function (){
            this.dropAreaNode.hide();
            this.dialogNode.hide();

            this.progressNumFilesDone.setHTML('0');
            this.progressNumFilesLeft.setHTML(this.filesList.length);

            this.progressIndicatorNode.show();
        },
        _uploadFinish: function (){
            var that = this;

            // show "all done!" label (which is behind the progress bar)
            this.progressBarNode.hide();

            if (this.rejectedFilesList.length) {
                this._removeRemainingItemsFromList( null );
            }

            this.uploaderNode.transition({
                    opacity: {
                        duration: 2,
                        value: 1
                    }
                }, function() {
                    that.uploaderNode.removeClass('uploading');
                    that.progressIndicatorNode.hide();
                    // return progress bar for future uses
                    that.progressBarNode.show();
                    that.dropAreaNode.show();
                }
            );
        },

        _uploadSingleFile: function (file){
            var request = new XMLHttpRequest(),
                that = this;
            request.open("post", "/nein-data/upload.php", true);

            // Set appropriate headers
            request.setRequestHeader("X_FILENAME", file.name);
            request.setRequestHeader("X-FILESIZE", file.size);
            request.setRequestHeader("X-FILETYPE", file.type);

            // Set listeners
            request.upload.addEventListener('progress', this._uploadProgress.bind(this));
            request.upload.addEventListener('load', this._uploadComplete.bind(this));

            // Send the file (
            request.send(file);

        },

        _uploadNextFileFromList: function (){

            //TODO: save index for safe delete later!
            var nextFile = this.filesList[this.filesList.length - 1];

            if (nextFile) {
                this._uploadSingleFile(nextFile);
            }
            else {
                this._uploadFinish();
            }

        },


        /**
         * Upload file using iFrame and AJAX-like style - fallback for older browsers
         *
         * @method _uploadFileOldStyle
         * @private
         */
        _uploadOldStyleStart: function (){

            this.uploaderNode.addClass('uploading');
            this.dropAreaNode.hide();
            this._progressBar.startSimpleProgress();
            this.progressNumFilesDone.setHTML('0');
            this.progressNumFilesLeft.setHTML('1');

            this.progressIndicatorNode.show();

            var fakeForm = document.getElementById("ez-ei-media-uploader-fake-form");
            var fileInput = document.getElementById("ez-ei-media-drop-file-browse");
            var clonedInput = fileInput.cloneNode(true);

            fakeForm.innerHTML = '';
            fakeForm.appendChild(clonedInput);
            fakeForm.submit();

        },

        _uploadOldStyleFinish: function (){
            var that = this;

            this._progressBar.stopSimpleProgress();
            // show "all done!" label (which is behind the progress bar)
            this.progressBarNode.hide();

            this.uploaderNode.transition({
                    opacity: {
                        duration: 2,
                        value: 1
                    }
                }, function() {
                    that.uploaderNode.removeClass('uploading');
                    that.progressIndicatorNode.hide();
                    // return progress bar for future uses
                    that.progressBarNode.show();
                    that.dropAreaNode.show();
                }
            );


        },




        /**
         * Returns human-readable size of the file
         *
         * @method _getReadableFileSizeString
         * @private
         * @param fileSizeInBytes {Int} actual file size
         * @return {Str} human-readable form of the size
         */
        _getReadableFileSizeString: function (fileSizeInBytes) {

            var i = -1;
            var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        },


        /*****************
         * EVENTS (MOSTLY UPLOADING)
         */
        _dropAreaDragOver: function (e){
            e.preventDefault();
        },

        _dropAreaDragEnter: function (e){
            e.preventDefault();
            this.uploaderNode.addClass('drag-over');
        },

        _dropAreaDragLeave: function (e){
            Y.log(e);
            e.preventDefault();
            if (e.relatedTarget != this.dropAreaNode) {
                this.uploaderNode.removeClass('drag-over');
            }
        },

        _dropAreaDrop: function (e){
            e.preventDefault();

            this.uploaderNode.removeClass('drag-over');

            this._openUploadDialog(e._event.dataTransfer.files);
        },

        _dropAreaClick: function (e){
            e.preventDefault();
            document.getElementById("ez-ei-media-drop-file-browse").click(e._event);
        },

        _fileListDeleteClick: function (e){
            e.preventDefault();
            this._removeFileFromList( e.currentTarget.get('parentNode').getAttribute('data-file-index'), null);
        },

        _uploadButtonClick: function (e){
            e.preventDefault();
            this._uploadStart();
            this._uploadNextFileFromList();
        },

        _uploadProgress: function (e){
            if (e.lengthComputable) {
                var percent = (e.loaded / e.total) * 100;
                Y.log(percent);
                this._progressBar.update(percent);
            }
        },

        _uploadComplete: function (e){
            this._progressBar.update(100);

            var numFilesDone = parseInt(this.progressNumFilesDone.getHTML(),10),
                numFilesLeft = parseInt(this.progressNumFilesLeft.getHTML(),10);
            numFilesDone++;
            numFilesLeft--;

            this.progressNumFilesDone.setHTML(numFilesDone);
            this.progressNumFilesLeft.setHTML(numFilesLeft);

            this._removeFileFromList(this.filesList.length - 1,  this._uploadNextFileFromList.bind(this));
        },

        _fileSelected: function (e){
            e.preventDefault();

//            Y.log(e);

            // determining weather we should should upload dialog or just upload the file old-style.

            if (e.currentTarget._node.files) {

                if (!!window.FileReader) {
                    this._openUploadDialog(e.currentTarget._node.files);
                } else {
                    // if multiple files in input but no fileAPI support!
                    // TODO: fallback to old-style?
                    alert('Your browser is not supporting fileAPI, which is not even possible! :)');
                }
            } else {
                this._uploadOldStyleStart();
            }

        },

        _iFrameFileLoaded: function (e){

            var iframeContent = document.getElementById("ez-ei-media-uploader-iframe").contentWindow.document.body.innerHTML;

            if (iframeContent) {

                var response = Y.JSON.parse(iframeContent);
                if (response.success) {
                    this._uploadOldStyleFinish();
                } else {
                    this._uploadOldStyleFinish();
                    alert('upload failed for some reason :(');
                }

            }
        }

    });

    Y.eZ.AssetsManager = eZAssetsManager;

}, '0.1alpha', ['widget','node']);
