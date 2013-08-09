Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelector: null,
    projectStore: null,
    grids: {},

    table_size: 10,
    defaults: { padding: 10 },
    items: [ 
        {xtype:'container', items: [ 
            {xtype: 'container', html: '<h1>Top of the App</h1> ' +
                    '<p>This app allows a user to select a project and find stories within that project. ' +
                    'Below this paragraph, there is a combobox listing projects and a button that starts the query. ' +
                    'The app will generate two tables, each containing the first ten items owned by the current ' +
                    'user for the selected project; one table for user stories and one for defects.</p>' }
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
        this.projectSelector = Ext.create('Rally.technicalservices.accessible.Combobox', {
            store: store,
            componentId: 'projectSelector',
            fieldLabel: 'Project'
        });
        
        this.down('#selector_box').add(this.projectSelector);
        
        this.down('#selector_box').add({
            xtype: 'button',
            text: 'Get Stories and Defects',
            itemId: 'run_query_button',
            buttonLabel : 'Get Stories and Defects',
            handler: this._getItems,
            scope: this
        });   

        Ext.get('alert_area').set({role:'alert'});
        
        this.down('#run_query_button').focus();
        this._alert("The application is loaded and available in an iFrame on the page. " +
                "Focus should be on the Get Stories button, which is after the project selector combo box.");
    },
    _getItems: function() {
        this._log("_getItems");
        this.return_message_array = []; // fill with message from each of the queries
        // Get the ref of the selected project
        var selected_project_ref = projectSelector.value;
        var context = this.getContext();
        context.put('project',selected_project_ref);
        context.put('projectScopeDown',false);
        console.log(context);
        this.setContext(context);
        console.log(this.getContext());
        var selected_project_name = projectSelector.options[projectSelector.selectedIndex].text;
        this._alert("Fetching Stories and Defects for " + selected_project_name + " project." );
        this._getItemsByType("hierarchicalrequirement",selected_project_ref);
        this._getItemsByType("defect",selected_project_ref);
    },
    // Loads/refreshes grid with subset of Stories from selected project
    _getItemsByType: function(type,project_ref) {
        this._log(['_getItems',type]);
        var me = this;


        // Clear out existing grid if present
        if (this.grids[type]) { this.grids[type].destroy(); }
           
        
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: type,
            limit: me.table_size,
            pageSize: me.table_size,
            context: {
                project: project_ref,
                projectScopeUp: false,
                projectScopeDown: false
            },
            filters: [ { property: 'Owner', value: 'currentuser' }],
            autoLoad:true,
            listeners: {
                scope: this,
                load: function(store,data,success){
                    this._makeGrid(store,type);
                }
            }
        });
        
    },
    edit_fields: {
        hierarchicalrequirement:  [
            {text:'Formatted ID',dataIndex:'FormattedID'},
            {text:'Name', dataIndex:'Name'},
            {text:'Description', dataIndex:'Description'},
            {text:'Schedule State', dataIndex:'ScheduleState' },
            {text:'Size', dataIndex:'PlanEstimate' },
            {text:'Release', dataIndex:'Release'},
            {text:'Iteration', dataIndex:'Iteration'}
        ],
        defect:  [
            {text:'Formatted ID',dataIndex:'FormattedID'},
            {text:'Name', dataIndex:'Name'},
            {text:'Schedule State', dataIndex:'ScheduleState' },
            {text:'Description',dataIndex:'Description'},
            {text:'State', dataIndex:'State'},
            
            {text:'Size', dataIndex:'PlanEstimate' },
            {text:'Release', dataIndex:'Release'},
            {text:'Iteration', dataIndex:'Iteration'}
        ]
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
        me._log("Field Editor Defs");
        var new_field_array = [];
        var type = record.get('_type');
        var field_array = this.edit_fields[type];
        
        Rally.data.ModelFactory.getModel({
            type: type,
            success: function(model) {
                Ext.Array.each(field_array, function(field) {
                    model.getField(field.dataIndex).getAllowedValueStore().load({
                        callback: function(records, operation, success) {
                            var allowed_values = [];
                            Ext.Array.each(records, function(allowedValue) {
                                allowed_values.push(allowedValue.get('StringValue'));
                            });
                            me._log(field.dataIndex + " ... " + allowed_values.join(','));
                            var new_field_def = field;
                            field.editor = { xtype:'rallytextfield' };
                            if ( allowed_values.length > 0 ) {
                                field.editor = {
                                    xtype: 'tsaccessiblefieldcombobox',
                                    model: type,
                                    context: {
                                        project: me.getContext().getProjectRef(),
                                        projectScopeDown: false,
                                        projectScopeUp: false
                                    },
                                    field: field.dataIndex,
                                    fieldLabel: field.text,
                                    componentId: 'comboBox-' + field.dataIndex
                                }
                            } else {
                                var rally_type = model.getField(field.dataIndex).attributeDefinition.AttributeType;
                                if (rally_type === "TEXT"){
                                    field.editor = {
                                        field: field.dataIndex,
                                        fieldLabel: field.text + " multiline rich text field",
                                        xtype: 'tsaccessiblehtmleditor',
                                        iframeAttrTpl: 'role="aria-textbox" aria-multiline="true"',

                                        listeners: {
                                            tab: function(ed,shift_key_pressed) {
                                                me._moveToNextItem(ed,shift_key_pressed);
                                            }
                                        }
                                    }
                                }
                            }
                            me._log(["field",model.getField(field.dataIndex)]);
                            if ( model.getField(field.dataIndex).readOnly ) {
                                field.editor.readOnly = true;
                            }
                            new_field_array.push(field);
                            
                            if (field_array.length == new_field_array.length ) {
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
                                
                                me._alert("Record " + record.get('FormattedID') + " available for editing in the edit area");
                                me.recordEditor.setFocusToItemNumber(0,true);
                            }
                        }
                    });
                });
            }
        });
    },
    // hack because the html editor steals focus and won't give it back from tabbing
    _moveToNextItem: function(component,shift_key_pressed) {
        var me = this;
        var direction = 1;
        if ( shift_key_pressed ) { direction = -1; }
        if (me.recordEditor) {
            if ( me.recordEditor.items ) {
                var next_idx = Ext.Array.indexOf(me.recordEditor.items,component) + direction;
                me.recordEditor.setFocusToItemNumber(next_idx,false);
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
        var type = record.get('_type');
        
        // TODO: have the editor return the new values
        var items = this.recordEditor.items;
        items.each( function(item) {
            if (item.value && item.itemId ) {
                var index = parseInt( item.itemId.replace(/^\D+/g, ''), 10 );
                var field_name = me.edit_fields[type][index].dataIndex;
                record.set(field_name, item.getValue());
                me._log(["Setting field/value",field_name, item.getValue()]);
            }
        });
        
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