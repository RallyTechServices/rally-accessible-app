Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelector: null,
    projectStore: null,
    grid: null,

    table_size: 10,
    items: [ 
        {xtype:'container', items: [ 
            {xtype: 'container', html: '<h1>Top of the App</h1> ' +
                    '<p>This app allows a user to select a project and find stories within that project. ' +
                    'Below this paragraph, there is a combobox listing projects and a button that starts the query. ' +
                    'The app will generate a table of the first ten user stories for the selected project.</p>' }
        ]},
        {xtype:'container',itemId:'selector_box', defaults: { padding: 5, margin: 5 }, layout: { type: 'hbox' } },
        {xtype:'container',itemId:'grid_box' },
        {xtype:'container', items: [
            {xtype:'container',html:'<h1>Alerts</h1>'},
            {xtype:'container',itemId:'alert_area',id:'alert_area'}
        ]}
    ],

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
    },
    launch: function() {       
        Ext.getBody().set({ role: 'application' });
        this._alert("The application is loading.");
        this._prepareBuffer();
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
        this._alert("The application is loaded and available in an iFrame on the page. Please navigate to the iFrame for a more full description.");
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
                    this._alert("The user story table has loaded.");
                }
            }
        });
        
        this.down('#grid_box').add(this.grid);
    }
    
});