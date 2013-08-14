Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    _projectSelector: null,
    _projectStore: null,
    grids: {},

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
            {xtype:'container',html:'<h2>Query Options</h2>'},
            {xtype:'container',itemId:'selector_box', defaults: { padding: 5, margin: 5 }, layout: { type: 'hbox' } }
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
        this._alert("The application is loading.");
        me.field_helpers = {};
        
        this._projectSelector = Ext.create('Rally.technicalservices.accessible.Combobox', {
            store: store,
            componentId: 'projectSelector',
            fieldLabel: 'Project'
        });
        
        me.down('#selector_box').add(this._projectSelector);

        me.down('#selector_box').add({
            xtype: 'button',
            text: 'Get Stories and Defects',
            itemId: 'run_query_button',
            buttonLabel : 'Get Stories and Defects',
            handler: me._getItems,
            scope: me
        });
        
        me.down('#selector_box').add({
            xtype: 'button',
            text: 'Create Story',
            itemId: 'create_story_button',
            buttonLabel : 'Create Story',
            handler: me._createItem,
            scope: me
        }); 
        
        me.down('#selector_box').add({
            xtype: 'button',
            text: 'Create Defect',
            itemId: 'create_defect_button',
            buttonLabel : 'Create Defect',
            handler: me._createItem,
            scope: me
        }); 

        Ext.get('alert_area').set({role:'alert'});
        
        me.down('#run_query_button').focus();
        me._alert("The application is loaded and available in an iFrame on the page. " +
                "Focus should be on the Get Stories button, which is after the project selector combo box.");

        
    },
    _createItem: function(button) {
        var me = this;
        this._log("_createItem");
        var selected_project_ref = me._projectSelector.getValue();
        var selected_project_name = me._projectSelector.getDisplayValue();
        
        var record_type = "UserStory";
        if ( button.buttonLabel == "Create Defect") {
            record_type = "Defect";
        }
        
        me._alert("Preparing edit area to enter values for new item");
        
        Rally.data.ModelFactory.getModel({
            type: record_type,
            success: function(model) {
                me.field_helpers["defect"] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                    modelType:'Defect',
                    app: me,
                    project: selected_project_ref,
                    listeners: {
                        load: function() {
                            me._log("Loaded defect field helper");
                            me.field_helpers["hierarchicalrequirement"] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                                app: me,
                                modelType:'UserStory',
                                project: selected_project_ref,
                                listeners: {
                                load: function() {
                                        me._log("Loaded user story field helper");
                                        me.return_message_array = []; // fill with message from each of the queries
                                          
                                        me._makeEditor(model);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    },
    _getItems: function() {
        var me = this;
        this._log("_getItems");
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
                    me._log("Loaded defect field helper");
                    me.field_helpers["hierarchicalrequirement"] = Ext.create('Rally.technicalservices.accessible.FieldHelper',{
                        app: me,
                        modelType:'UserStory',
                        project: selected_project_ref,
                        listeners: {
                        load: function() {
                                me._log("Loaded user story field helper");
                                me.return_message_array = []; // fill with message from each of the queries

                                me._alert("Fetching Stories and Defects for " + selected_project_name + " project." );
                                me._getItemsByType("hierarchicalrequirement",selected_project_ref);
                                me._getItemsByType("defect",selected_project_ref);

                            }
                        }
                    });
                }
            }
        });
        
        
    },
    // Loads/refreshes grid with subset of Stories from selected project
    _getItemsByType: function(type,project_ref) {
        this._log(['_getItems',type]);
        var me = this;

        // Clear out existing grid if present
        if (this.grids[type]) { this.grids[type].destroy(); }

        var filters = Ext.create('Rally.data.QueryFilter', {
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
        
        me._log("using filter: " + filters.toString());
        
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: type,
            limit: me.table_size,
            pageSize: me.table_size,
            context: {
                project: project_ref,
                projectScopeUp: false,
                projectScopeDown: false
            },
            filters: filters,
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
                {text:'Size', dataIndex:'PlanEstimate' }
            ],
            defect: [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'Schedule State', dataIndex:'ScheduleState'},
                {text:'Defect State',dataIndex:'State'},
                {text:'Size', dataIndex:'PlanEstimate' }
            ]
    },
    friendly_names: {
        "Defect": "Defect",
        "defect": "Defect",
        "userstory": "User Story",
        "hierarchicalrequirement":"User Story"
    },
    /*
     * make a grid, given a store and the global grid we're talking about
     * (for story or defect grid)
     */
    _makeGrid: function(store, type) {
        this._log("_makeGrid " + type);
        var me = this;
        if (this.grids[type]) { this.grids[type].destroy(); }
        
        this.grids[type] = Ext.create('Rally.technicalservices.accessible.grid',{
            store: store,
            title: me.friendly_names[type] || type,
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
                    this._log(recordToEdit);
                    this._makeEditor(recordToEdit);
                }
            }
        });
        
        this.down('#' + type + '_grid_box').add(this.grids[type]);
    },
    /*
     * expecting record, [ {text:'field name',dataIndex:'fieldname'} ]
     */
    _makeEditorFieldDefsAndEditor: function(record) {
        var me = this;
        me._log(["Field Editor Defs",record]);
        var new_field_array = [];
        var type = record.typePath;
        if ( !type ) {
            type = record.get('_type');
        }
        me._log(["Record type",type]);
        me._log(me.field_helpers);
        field_array = me.field_helpers[type].getFieldsAsColumns();
        
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
                        me._saveRecord(record);
                    } else {
                        me._alert('Cancel pressed. Editor cleared.');
                        me.recordEditor.destroy();
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
        this._log(this);
        var direction = 1;
        if ( shift_key_pressed ) { direction = -1; }
        if (this.recordEditor) {
            if ( this.recordEditor.items ) {
                this._log("is a recordEditor");
                var next_idx = Ext.Array.indexOf(this.recordEditor.items,component) + direction;
                this._log(next_idx);
                this.recordEditor.setFocusToItemNumber(next_idx,false);
            }
        }
    },
    _makeEditor: function(record) {
        this._log(["_makeEditor",record]);
        var me = this;
        if (this.recordEditor) {
            this.recordEditor.destroy();
        }
        
        this._makeEditorFieldDefsAndEditor(record);
    },
    
    _saveRecord: function(record) {
        this._log('_saveRecord');
        var me = this;
        me._alert("Saving Record.");
        me._log(record);
        
        var selected_project_ref = me._projectSelector.getValue();

        // TODO: have the editor return the new values
        var items = this.recordEditor.items;
        var item_hash = {};
        
        items.each( function(item) {
            if (item.xtype !== "button" && item.getValue() && item.getValue() !== "-- No Entry --") {
                me._log(item);
                var field_name = item.field.name || item.field;
                if (typeof record.set === 'function') {
                    record.set(field_name, item.getValue());
                } else {
                    item_hash[field_name] = item.getValue();
                }
                me._log(["Setting field/value",field_name, item.getValue()]);
            }
        });
        
        if ( typeof record.set !== 'function') {
            item_hash.Project =    selected_project_ref;
            // todo: set current user
            //item_hash.SubmittedBy = ;
            record = Ext.create(record, item_hash);
        }
        
        record.save({
            callback: function(result, operation) {
                if(operation.wasSuccessful()) {
                    me._alert("Record saved, editor cleared");
                    // remove the editor
                    me.recordEditor.destroy();
                    // refresh the grid
                    me._getItems();
                } else {
                    me._log(operation);
                    alert("Could not save the record. The message from the server is: " +
                        operation.error.errors[0] );
                }
            }
        });
        

    },

    _log: function(msg) {
        window.console && console.log( this.self.getName(),' -- ', msg );  
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