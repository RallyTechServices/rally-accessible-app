Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    _projectSelector: null,
    _projectStore: null,
    grids: {},
    
    logger: new Rally.technicalservices.logger(),
    table_size: 10,
    defaults: { padding: 10 },
    items: [ 
        {xtype:'container', items: [ 
            {xtype: 'container', html: '<h1>Top of the App</h1> ' +
                    '<p>This app allows a user to select a project and find stories within that project. ' +
                    'Below this paragraph, there is a combobox listing projects and a button that starts the query. ' +
                    'The app will generate two tables, each containing the first ten items owned by the current ' +
                    'user for the selected project; one table for user stories and one for defects.  There are ' +
                    'also a pair of buttons to allow you to create a story or defect.</p>' }
        ]},
        {xtype:'container',items: [ 
            {xtype:'container',html:'<h2>Project Selection</h2>'},
            {xtype:'container',itemId:'project_box', defaults: { padding: 5, margin: 5 }, layout: { type: 'hbox' }}
        ]},
        {xtype:'container',items: [
            {xtype:'container',html:'<h2>Query Options</h2>'},
            {xtype:'container',itemId:'query_box', defaults: { padding: 5, margin: 5 } }
        ]},
        {xtype:'container',items:[
            {xtype:'container',html:'<h2>Create New Items</h2>'},
            {xtype:'container',itemId:'create_box',defaults: { padding: 5, margin: 5 }, layout: { type: 'hbox' } }
        ]},
        {xtype:'container',itemId:'grid_box', items: [
            {xtype:'container',html:'<h2>Resulting User Story Grid Area</h2>'},
            {xtype:'container',itemId:'hierarchicalrequirement_grid_box'},
            {xtype:'container',html:'<h2>Resulting Defect Grid Area</h2>'},
            {xtype:'container',itemId:'defect_grid_box'}
        ]},
        {xtype:'container',itemId:'editor_box', items: [{xtype:'container',html:'<h2>Edit Area</h2>'}] },
        {xtype:'container', items: [
            {xtype:'container',html:'<h2>Alerts</h2>'},
            {xtype:'container',itemId:'alert_area',id:'alert_area'}
        ]}
    ],
    launch: function() {       
        //Ext.getBody().set({ role: 'application' });
        this._alert("The application is loading.");
        this._prepareBuffer();
        
        this.logger.log(this,["user",this.getContext().getUser()]);
        
        this.projectStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'Project',
            autoLoad: true,
            limit: 400,
            fetch: ['ObjectID', 'Name'],
            listeners: {
                load: this._onProjectStoreLoaded,
                scope: this
            },
            filters: [
                {
                    property: 'State',
                    value: 'Open'
                }
            ],
            sorters: [
                {
                    property: 'Name',
                    direction: 'ASC'
                }
            ]
        });
    },
    
    _onProjectStoreLoaded: function(store, data) {
        var me = this;
        Ext.get('alert_area').set({role:'alert'});
        Ext.get('alert_area').set({"aria-live":"polite"});
        this._alert("The application is loading.");
        me.field_helpers = {};
        
        this._projectSelector = Ext.create('Rally.technicalservices.accessible.Combobox', {
            store: store,
            componentId: 'projectSelector',
            fieldLabel: 'Project'
        });
        
        me.down('#project_box').add(this._projectSelector);

        me.down('#query_box').add({
            xtype: 'button',
            text: 'Get My Stories and Defects',
            itemId: 'run_query_button',
            buttonLabel : 'Get My Stories and Defects',
            handler: function(button) {
                this._filters = null;
                me._getItems(null);
            },
            scope: me
        });
        
        me.down('#create_box').add({
            xtype: 'button',
            text: 'Create Story',
            itemId: 'create_story_button',
            buttonLabel : 'Create Story',
            handler: me._createItem,
            scope: me
        }); 
        
        me.down('#create_box').add({
            xtype: 'button',
            text: 'Create Defect',
            itemId: 'create_defect_button',
            buttonLabel : 'Create Defect',
            handler: me._createItem,
            scope: me
        }); 
        
        me.down('#query_box').add({
            xtype:'tsaccessiblequerybox',
            listeners: {
                querydefined: function(qb, filters){
                    me.logger.log(this,"querydefined");
                    this._filters = filters;
                    me._getItems(filters);
                },
                scope: me
            }
        });
        
        Ext.get('alert_area').set({role:'alert'});
        
        me.down('#run_query_button').focus();
        me._alert("Hi, " + this.getContext().getUser()._refObjectName + ", the application is loaded and available in an iFrame on the page. " +
                "Focus should be on the Get My Stories button, which is after the project selector combo box.");

    },
    _createItem: function(button,record_type,incoming_default_values) {
        var me = this;
        this.logger.log(this,"_createItem");
        this._clearTargets();
        
        var selected_project_ref = me._projectSelector.getValue();
        var selected_project_name = me._projectSelector.getDisplayValue();
        
        if (typeof record_type !== "string" || ! record_type ) {
            if ( button.buttonLabel == "Create Defect") {
                record_type = "Defect";
            } else {
                record_type = "UserStory";
            }
        }
        
        var default_values = {
            "SubmittedBy": me.getContext().getUser(),
            "Project"    : me._projectSelector.getValue()
        };
        
        var outgoing_default_values = Ext.Object.merge(default_values,incoming_default_values);
        
        me._alert("Preparing edit area to enter values for new item");
        
        me.logger.log(this,record_type);
        Rally.data.ModelFactory.getModel({
            type: record_type,
            success: function(model) {
                me.field_helpers[me.official_names[record_type.toLowerCase()]] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                    modelType:record_type,
                    app: me,
                    project: selected_project_ref,
                    listeners: {
                        load: function() {
                            me.logger.log(this,"Loaded " + record_type + " field helper");
                            me.return_message_array = []; // fill with message from each of the queries
                            me._prepareForEditArea(model,outgoing_default_values);
                        }
                    }
                });
            }
        });
    },
    _getItems: function(filters) {
        var me = this;
        this.logger.log(this,"_getItems");
        this._clearTargets();
        
        var selected_project_ref = me._projectSelector.getValue();
        var selected_project_name = me._projectSelector.getDisplayValue();
        // Get the ref of the selected project
        var context = me.getContext();
        context.put('project',selected_project_ref);
        context.put('projectScopeDown',false);
        me.setContext(context);

        me.field_helpers["defect"] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
            app: me,
            modelType:'Defect',
            project: selected_project_ref,
            listeners: {
                load: function() {
                    me.logger.log(this,"Loaded defect field helper");
                    me.field_helpers["hierarchicalrequirement"] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                        app: me,
                        modelType:'UserStory',
                        project: selected_project_ref,
                        listeners: {
                        load: function() {
                                me.logger.log(this,"Loaded user story field helper");
                                me.return_message_array = []; // fill with message from each of the queries

                                me._alert("Fetching Stories and Defects for " + selected_project_name + " project." );
                                me._getItemsByType("hierarchicalrequirement",selected_project_ref,filters);
                                me._getItemsByType("defect",selected_project_ref,filters);

                            }
                        }
                    });
                }
            }
        });
        
        
    },
    // Loads a grid with subset of items of the selected type from selected project
    _getItemsByType: function(type,project_ref,filters) {
        this.logger.log(this,['_getItemsByType',type,filters]);
        var me = this;
        
        var context = {
            project: null,
            projectScopeUp: true,
            projectScopeDown: true
        };

        // Clear out existing grid if present
        if (this.grids[type]) { this.grids[type].destroy(); }

        if (!filters) {
            context = {
                project: project_ref,
                projectScopeUp: false,
                projectScopeDown: false
            };
            
            filters = Ext.create('Rally.data.QueryFilter', {
                 property: 'Owner',
                 operator: '=',
                 value: 'currentuser'
            });
            
            if (type.toLowerCase() === "defect") {
                filters = filters.or(Ext.create('Rally.data.QueryFilter',{
                     property: 'SubmittedBy',
                     operator: '=',
                     value: 'currentuser'
                }));
            }
        }
        
        var fetch_fields = me._getValueArrayFromArrayOfHashes(me.table_columns[type], "dataIndex");
        me.logger.log(this,["Fetching with",fetch_fields]);
        
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: type,
            limit: me.table_size,
            pageSize: me.table_size,
            context: context,
            sorters: [
                {
                    property: 'ObjectID',
                    direction: 'DESC'
                }
            ],
            filters: filters,
            fetch: fetch_fields,
            autoLoad:true,
            listeners: {
                scope: this,
                load: function(store,data,success){
                    this._makeGrid(store,type);
                }
            }
        });
        
    },
    
    table_columns: {
        hierarchicalrequirement: [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'Schedule State', dataIndex:'ScheduleState'},
                {text:'Number of Tasks', dataIndex:'Tasks'},
                {text:'Size', dataIndex:'PlanEstimate' }
            ],
            defect: [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'Schedule State', dataIndex:'ScheduleState'},
                {text:'Defect State',dataIndex:'State'},
                {text:'Number of Tasks', dataIndex:'Tasks'},
                {text:'Size', dataIndex:'PlanEstimate' }
            ]
    },
    friendly_names: {
        "Defect": "Defect",
        "defect": "Defect",
        "userstory": "User Story",
        "hierarchicalrequirement":"User Story",
        "task": "Task"
    },
    official_names: {
        "defect": "defect",
        "story":"hierarchicalrequirement",
        "userstory":"hierarchicalrequirement",
        "hierarchicalrequirement":"hierarchicalrequirement",
        "task":"task"
    },
    _getValueArrayFromArrayOfHashes: function(hash_array,key){
        var key_array = [];
        Ext.Array.each( hash_array, function(hash){
            key_array.push(hash[key]);
        });
        return key_array;
    },
    /*
     * make a grid, given a store and the global grid we're talking about
     * (for story or defect grid)
     */
    _makeGrid: function(store, type) {
        this.logger.log(this,"_makeGrid " + type);
        var me = this;
        if (this.grids[type]) { this.grids[type].destroy(); }

        this.grids[type] = Ext.create('Rally.technicalservices.accessible.grid',{
            store: store,
            title: 'Table of ' + me.friendly_names[type] + "s",
            caption: 'Table of ' + me.friendly_names[type] + "s",
            columns: me.table_columns[type],
            editFieldName: 'Name',
            listeners: {
                scope: this,
                afterrender: function() {
                    me.return_message_array.push("Loaded " + me.grids[type].getCount() + " " + me.friendly_names[type] + "s into a table.");
                    if ( me.return_message_array.length == 2 ) {
                        me._alert(me.return_message_array.join(', '));
                    }
                },
                recordeditclick: function(g, recordToEdit) {
                    this.logger.log(this,recordToEdit);
                    this._prepareForEditArea(recordToEdit);
                }
            }
        });
        
        this.down('#' + type + '_grid_box').add(this.grids[type]);
    },
    /*
     * expecting record
     */
    _displayEditArea: function(record,default_values) {
        var me = this;
        me._alert("Preparing edit area");
        me.logger.log(this,["display edit area with record:",record]);
        var new_field_array = [];
        var type = record.typePath;
        if ( !type ) {
            type = record.get('_type');
        }
        me.logger.log(this,["Record type",type]);
        var field_array = me.field_helpers[type].getFieldsAsColumns();
        
        me.recordEditor = Ext.create('Rally.technicalservices.accessible.editarea',{
            fields: field_array,
            record: record,
            buttons: [
                { text: 'Save' },
                { text: 'Cancel' }
            ],
            listeners: {
                buttonclick: function(editor,record,button) {
                    if ( button.text == "Save" ) {
                        me._saveRecord(record,editor,default_values);
                    } else {
                        me._alert('Cancel pressed. Editor cleared.');
                        me.recordEditor.destroy();
                    }
                },
                alert: function(source,message) {
                    me._alert(message);
                },
                replaceMe: function(editor,recordToEdit){
                    me.logger.log(this,["Gonna redraw the edit area",recordToEdit]);
                    
                    if ( !recordToEdit ) {
                        // hit the add button
                        me._createItem(null,"Task",{ WorkProduct: record.get('_ref') } );
                    } else {
                        var record_type = recordToEdit.typePath;
                        if ( !record_type ) {
                            record_type = recordToEdit.get('_type');
                        }
                        var selected_project_ref = me._projectSelector.getValue();
                        var clean_type = me.official_names[record_type.toLowerCase()];
    
                        me.logger.log(this,"about to make a fieldhelper for " + clean_type);
                        me.field_helpers[clean_type] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                            modelType:record_type,
                            app: me,
                            project: selected_project_ref,
                            listeners: {
                                load: function() {
                                    me.logger.log(this,"Loaded " + record_type + " field helper");
                                    me.return_message_array = []; // fill with message from each of the queries
                                    me._prepareForEditArea(recordToEdit,{});
                                }
                            }
                        });
                    }
                }
            }
        });
        me.down('#editor_box').add(me.recordEditor);
        
        me._alert("Record available for editing in the edit area");
        me.recordEditor.setFocusToItemNumber(0,true);
    },
    // hack because the html editor steals focus and won't give it back from tabbing
    // TODO: move this into the editor itself
    _moveToNextItem: function(component,shift_key_pressed) {
        var direction = 1;
        if ( shift_key_pressed ) { direction = -1; }
        if (this.recordEditor) {
            if ( this.recordEditor.items ) {
                this.logger.log(this,"is a recordEditor");
                var next_idx = Ext.Array.indexOf(this.recordEditor.items,component) + direction;
                this.logger.log(this,next_idx);
                this.recordEditor.setFocusToItemNumber(next_idx,false);
            }
        }
    },
    _prepareForEditArea: function(record, default_values) {
        this.logger.log(this,["_prepareForEditArea",record,default_values]);
        var me = this;
        me._alert("Preparing edit area");
        if (this.recordEditor) {
            this.recordEditor.destroy();
        }
        
        // reload the record (if we're not creating for the first time)
        if ( record && typeof record.get === 'function') {
            var fetch_array = [];
            var type = record.typePath;
            if ( !type ) {
                type = record.get('_type');
            }
            var fh = me.field_helpers[type];
            if ( !fh ) { fh=me.field_helpers[type.toLowerCase()];}

            Ext.Array.each(fh.getFieldsAsColumns(), function(field){
                fetch_array.push(field.dataIndex);
            });
            var filters = { property:'ObjectID',value:record.get('ObjectID') };
            
            Ext.create('Rally.data.WsapiDataStore',{
                model: type,
                limit: 1,
                pageSize: 1,
                context: { project: null },
                filters: filters,
                autoLoad:true,
                fetch: fetch_array,
                listeners: {
                    scope: this,
                    load: function(store,data,success){
                        this._displayEditArea(data[0],default_values);
                    }
                }
            });
        } else {
            this._displayEditArea(record,default_values);
        }
    },
    
    _saveRecord: function(record,form,default_values) {
        this.logger.log(this,'_saveRecord');
        var me = this;
        me._alert("Saving Record.");
        
        // TODO: have the editor return the new values
        var items = this.recordEditor.items;
        var item_hash = {};
        
        items.each( function(item) {
            if (item.xtype !== "button" && item.getValue() && item.getValue() !== "-- No Entry --") {
                var field_name = item.field.name || item.field;
                if (typeof record.set === 'function') {
                    record.set(field_name, item.getValue());
                } else {
                    item_hash[field_name] = item.getValue();
                }
                me.logger.log(this,["Setting field/value",field_name, item.getValue()]);
            }
        });
        
        if ( typeof record.set !== 'function') {
            item_hash = Ext.Object.merge(default_values,item_hash);
            record = Ext.create(record, item_hash);
        }
        
        record.save({
            callback: function(result, operation) {
                if(operation.wasSuccessful()) {
                    me._alert("Record saved, editor cleared");
                    // remove the editor
                    me.recordEditor.destroy();
                    // refresh the grid
                    me._getItems(me._filters);
                } else {
                    me.logger.log(this,operation);
                    me._alert("Could not save the record. The message from the server is: " +
                        operation.error.errors[0] );
                    me._handleErrorsFromForm(form,operation.error.errors);
                }
            }
        });
    },
    _getFieldFromError: function(error_type, error_message) {
        var me = this;
        this.logger.log(this,["_getFieldFromError",error_type,error_message]);
        
        var field_name = null;
        if (error_type === "Validation error"){
            var dot_split = error_message.split('.');
            if ( dot_split.length > 1 ) {
                var space_split = dot_split[1].split(' ');
                field_name = space_split[0];
            } else {
                field_name = dot_split[0];
            }
        } else if (error_type === "Could not convert") {
            var quote_split = error_message.split('"');
            if ( quote_split.length > 2 ) {
                field_name = quote_split[1];
            }
        }
        // fix fieldname if old one given in error message
        if ( field_name === "Estimate" ) { field_name = "PlanEstimate"; }
        me.logger.log(this,"Got " + field_name + " from " + error_message);
        return field_name;
    },
    _handleErrorsFromForm: function(form,errors) {
        var me = this;
        me.logger.log(this,["_handleErrorsFromForm",errors]);
        
        if ( this._form_errors_area ) { this._form_errors_area.destroy(); }
        this._form_errors_area = this.down('#editor_box').insert(1,{xtype:'container',tabIndex:"0"});
        var header = this._form_errors_area.add({xtype:'container',html:"<h2>Submission Errors</h2>"});
        var error_resolution_list = [];
        Ext.Array.each(errors,function(error){
            var error_split = error.split(':');

            if ( error_split.length < 2 ) {
                error_resolution_list.push(error);
            } else {
                var error_type = error_split[0];
                var error_message = error_split[1];
                if ( error_type !== "Validation error" && error_type !== "Could not convert" ) {
                    error_resolution_list.push(error_message);
                } else {
                    var ignore_error_fields = ["WorkProductName"];
                    
                    var field_name = me._getFieldFromError(error_type, error_message);
                    if ( Ext.Array.indexOf(ignore_error_fields,field_name) === -1 ) {
                        var field_id = form.getFieldIdByName(field_name);
                        if ( field_id ) {
                            error_resolution_list.push(
                                '<a href="#' + field_id + '" id="' + field_id + '-link" tabindex="0">' + 
                                error_message + 
                                '</a>'
                            );
                        } else {
                            error_resolution_list.push(error_message);
                        }
                    }
                }
            }
        });
        var data = { Errors: error_resolution_list };
        var list = this._form_errors_area.add({
            xtype:'container',
            autoRender: true,
            tpl:['<ul>',
                '<tpl for="Errors">',
                '<li tabindex="0">{.}</li>',
                '</tpl>',
                '</ul>'],
            data:data
        });
        
        var html_node = list.getEl().dom;
        var links = Ext.dom.Query.select('a',html_node);
        if (links.length > 0 ) {
            links[0].focus(false);
        }
        Ext.Array.each(links, function(link){
            Ext.get(link.id).addListener('click',me._focusOnFormElement,this,form);
        });
    },
    _focusOnFormElement:function(event,link,form) {
        var field_id = link.id.replace(/-link/,"");
        Ext.get(field_id).focus(true);
        return false;
    },
    _clearTargets: function() {
        if ( this.recordEditor ) {
            this.recordEditor.destroy();
        }
        if (this.grids !== {} ) { 
            for ( var i in this.grids ) {
                if ( this.grids[i] ) { this.grids[i].destroy(); }
            }
        }
        
        if ( this._form_errors_area ) { this._form_errors_area.destroy(); }
    },
    
    _alert: function(message) {
        this.down('#alert_area').removeAll();
        this.down('#alert_area').add({ xtype:'container',html:'<span role="alert">' + message + "</span>"});

        var objHidden = document.getElementById('virtualbufferupdate');
    
        if (objHidden)
        {
            if (objHidden.getAttribute('value') == '1') {
                objHidden.setAttribute('value', '0');
            } else {
                objHidden.setAttribute('value', '1');
            }
        } else {
            this._prepareBuffer();
        }
    },
    _prepareBuffer: function(){
        var objNew = document.createElement('p');
        var objHidden = document.createElement('input');
    
        objHidden.setAttribute('type', 'hidden');
        objHidden.setAttribute('value', '1');
        objHidden.setAttribute('id', 'virtualbufferupdate');
        objHidden.setAttribute('name', 'virtualbufferupdate');
    
        objNew.appendChild(objHidden);
        Ext.getBody().appendChild(objNew);
    }
    
    
});