Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelector: null,
    projectStore: null,
    grid: null,
    recordEditor: null,

    items: [ 
        {xtype:'container',itemId:'selector_box', defaults: { padding: 5, margin: 5 }},
        {xtype:'container',itemId:'grid_box' },
        {xtype:'container',itemId:'alert_area',id:'alert_area'},
        {xtype:'container',itemId:'editor_area',id:'editor_area'}
    ],

    _log: function(msg) {
        window.console && console.log( msg );  
    },
    
    _alert: function(message) {
        this.down('#alert_area').removeAll();
        this.down('#alert_area').add({ xtype:'container',html:'<span role="alert">' + message + "</span>"});
    },
    
    launch: function() {       
        Ext.getBody().set({ role: 'application' });

        this.projectStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'Project',
            autoLoad: true,
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
            componentId: 'projectSelector'
        });
        
        this.down('#selector_box').add(this.projectSelector);
        
        this.down('#selector_box').add({
            xtype: 'button',
            text: 'Get Stories',
            buttonLabel : 'Get Stories',
            handler: this._getStories,
            scope: this
        });   

        Ext.get('alert_area').set({role:'alert'});
        this._alert("Select project and use button to list user stories");
    },
    
    
    // Loads/refreshes grid with subset of Stories from selected project
    _getStories: function() {
        this._log('_getStories');
        // Get the ref of the selected project

        console.log(projectSelector.value);

        var selectedProjectRef = projectSelector.value;
        var selectedProjectName = projectSelector.options[projectSelector.selectedIndex].text
        this._alert("Loading Stories for " + selectedProjectName );

        // Clear out existing grid if present
        if (this.grid) {
            this.remove(this.grid);
        }
        
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: 'User Story',
            context: {
                project: selectedProjectRef,
                projectScopeUp: false,
                projectScopeDown: false
            },
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
                {text:'Schedule State', dataIndex:'ScheduleState'}
            ],
            listeners: {
                scope: this,
                afterrender: function() {
                    this._alert("Table Ready");
                }
            },
            editListener: {
                editButtonClicked: this._editRecord,
                scope: this
            },
            editContainer: this.down('#editor_area')
        });
        
        this.down('#grid_box').add(this.grid);
    },

    _editRecord: function(record) {

        if (this.recordEditor) {
            this.recordEditor.destroy();
        }
        
        var itemsArray = new Array();
        
        for (var i=0; i<this.columns.length; i++) {            
            var thisItem = {
                xtype: 'rallytextfield',
                fieldLabel: this.columns[i].text,
                value: record[this.columns[i].dataIndex]
            }
            itemsArray.push(thisItem);
        }        
        
        // Add a save button
        itemsArray.push({
            xtype: 'button',
            text: 'Save Edits',
            buttonLabel : 'Save Edits',
            handler: this._saveRecord,
            scope: this            
        });
        
        this.recordEditor = Ext.create('Ext.Container', {
            items: itemsArray
        });        
        
        this.editContainer.add(this.recordEditor);        
    },
    
    _saveRecord: function() {
        this._log('_saveRecord');        
    }
    
});