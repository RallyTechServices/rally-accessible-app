Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelector: null,
    projectStore: null,
    grid: null,

    table_size: 10,
    defaults: { padding: 10 },
    items: [ 
        {xtype:'container', items: [ 
            {xtype: 'container', html: '<h1>Top of the App</h1> ' +
                    '<p>This app allows a user to select a project and find stories within that project. ' +
                    'Below this paragraph, there is a combobox listing projects and a button that starts the query. ' +
                    'The app will generate a table of the first ten user stories owned by the current user for the selected project.</p>' }
        ]},
        {xtype:'container',items: [
            {xtype:'container',html:'<h1>Query Options</h1>'},
            {xtype:'container',itemId:'selector_box', defaults: { padding: 5, margin: 5 }, layout: { type: 'hbox' } }
        ]},
        {xtype:'container',itemId:'grid_box', items: [{xtype:'container',html:'<h3>Resulting User Story Grid Area</h3>'}]},
        {xtype:'container',itemId:'editor_box', items: [{xtype:'container',html:'<h3>Edit Area</h3>'}] },
        {xtype:'container', items: [
            {xtype:'container',html:'<h1>Alerts</h1>'},
            {xtype:'container',itemId:'alert_area',id:'alert_area'}
        ]}
    ],
    launch: function() {       
        Ext.getBody().set({ role: 'application' });
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
            text: 'Get Stories',
            itemId: 'get_stories_button',
            buttonLabel : 'Get Stories',
            handler: this._getStories,
            scope: this
        });   

        Ext.get('alert_area').set({role:'alert'});
        
        this.down('#get_stories_button').focus();
        this._alert("The application is loaded and available in an iFrame on the page. " +
                "Focus should be on the Get Stories button, which is after the project selector combo box.");
    },
    
    // Loads/refreshes grid with subset of Stories from selected project
    _getStories: function() {
        this._log('_getStories');
        var me = this;
        // Get the ref of the selected project
        var selectedProjectRef = projectSelector.value;
        var selectedProjectName = projectSelector.options[projectSelector.selectedIndex].text;
        this._alert("Loading Stories for " + selectedProjectName + " project." );

        // Clear out existing grid if present
        if (this.grid) {
            this.remove(this.grid);
        }
        
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: 'User Story',
            limit: me.table_size,
            pageSize: me.table_size,
            context: {
                project: selectedProjectRef,
                projectScopeUp: false,
                projectScopeDown: false
            },
            filters: [ { property: 'Owner', value: 'currentuser' }],
            autoLoad:true,
            listeners: {
                scope: this,
                load: function(store,data,success){
                    this._makeGrid(store);
                }
            }
        });
        
    },
    
    _makeGrid: function(store) {
        if (this.grid) { this.grid.destroy(); }
        
        this.grid = Ext.create('Rally.technicalservices.accessible.grid',{
            store: store,
            title: 'User Stories',
            caption: 'Table of User Stories',
            columns: [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'Schedule State', dataIndex:'ScheduleState'},
                {text:'Size', dataIndex:'PlanEstimate' }
            ],
            editFieldName: 'Name',
            listeners: {
                scope: this,
                afterrender: function() {
                    this._alert("Loaded " + this.grid.getCount() + " user stories into the table.");
                },
                recordeditclick: function(grid, recordToEdit) {
                    this._log(recordToEdit);
                    this._makeEditor(recordToEdit);
                }
            }
        });
        
        this.down('#grid_box').add(this.grid);
    },
    /*
     * expecting record, [ {text:'field name',dataIndex:'fieldname'} ]
     */
    _makeEditorFieldDefsAndEditor: function(record, field_array) {
        var me = this;
        me._log("Field Editor Defs");
        var new_field_array = [];
        var type = 'UserStory';
        
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
                            field.editor = 'rallytextfield';
                            if ( allowed_values.length > 0 ) {
                                field.editor = {
                                    xtype: 'tsaccessiblefieldcombobox',
                                    model: type,
                                    field: field.dataIndex,
                                    fieldLabel: field.text
                                }
                            }
                            new_field_array.push(field);
                            
                            if (field_array.length == new_field_array.length ) {
                                me.recordEditor = Ext.create('Rally.technicalservices.accessible.editor',{
                                fields: new_field_array,
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
                                            me._makeEditor(record);
                                        }
                                    }
                                }
                            });
                             
                            me.down('#editor_box').add(me.recordEditor);
                            
                            me._alert("Record " + record.get('FormattedID') + " available for editing in the edit area");
                            me.down('#field_0').focus(true);

                            }
                        }
                    });
                });
            }
        });
        
        
    },
    _makeEditor: function(record) {
        this._log(["_makeEditor",record]);
        var me = this;
        if (this.recordEditor) {
            this.recordEditor.destroy();
        }
        
        this.fields = [
            {text:'Name', dataIndex:'Name'},
            {text:'Schedule State', dataIndex:'ScheduleState' },
            {text:'Size', dataIndex:'PlanEstimate' }
            ];
        
        this._makeEditorFieldDefsAndEditor(record,this.fields);
        
        
    },
    
    _saveRecord: function(record) {
        this._log('_saveRecord');
        var me = this;
        
        // TODO: have the editor return the new values
        var items = this.recordEditor.items;
        items.each( function(item) {
            if (item.value && item.itemId ) {
                var index = parseInt( item.itemId.replace(/^\D+/g, ''), 10 );
                var field_name = me.fields[index].dataIndex;
                record.set(field_name, item.value);
                me._log(["Saving field/value",field_name, item.value]);
            }
        });
        
        record.save({
            callback: function(result, operation) {
                if(operation.wasSuccessful()) {
                    me._alert("Record saved");
                    // remove the editor
                    me.recordEditor.destroy();
                    // refresh the grid
                    me._getStories();
                } else {
                    me._log(operation);
                    alert("Could not save the record. The message from the server is: " +
                        operation.error.errors[0] );
                }
            }
        });
        

    },

    _log: function(msg) {
        window.console && console.log( msg );  
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