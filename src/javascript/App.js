Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelectorComponent : null,
    projectSelector: null,
    grid: null,
    accessibleGridBuilder: null,
    accessibleGridPanel: null,
    items: [ 
        {xtype:'container',itemId:'selector_box', defaults: { padding: 5, margin: 5 }},
        {xtype:'container',itemId:'grid_box' },
        {xtype:'container',itemId:'alert_area',id:'alert_area'}
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
                
        projectSelectorComponent = Ext.create('Rally.technicalservices.accessible.ProjectSelector', {
            title: 'Select Project',
            modelType: 'Project',
            componentId: 'projectSelector',
            storeSorters: [
                {
                    property: 'Name',
                    direction: 'ASC'
                }
            ],
            listeners: {
                ready: this._projectSelectorLoaded,
                scope: this
            }
        });
           
    },
    
    _projectSelectorLoaded: function() {
        
        var selectorHtml = projectSelectorComponent.getComponentHtml();
        
        projectSelector = new Ext.Component({
            renderTo: Ext.getBody(),
            autoEl: {
                tag:'select',
                cls:'x-font-select',
                html: selectorHtml
            }
        });
        
        this.down('#selector_box').add(projectSelector);
        
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
        var selectedProjectRef = projectSelector.getEl().dom.value;
        var selectedProjectName = projectSelector.getEl().dom.options[projectSelector.getEl().dom.selectedIndex].text
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
        if (this.grid){this.grid.destroy();}
        
        this.grid = Ext.create('Rally.technicalservices.accessible.grid',{
            store: store,
            title: 'User Stories',
            caption: 'Table of User Stories',
            columns: [
                {text:'id',dataIndex:'FormattedID'},
                {text:'Name',dataIndex:'Name'},
                {text:'Schedule State',dataIndex:'ScheduleState'}
            ],
            listeners: {
                scope: this,
                afterrender: function() {
                    this._alert("Table Ready");
                }
            }
        });
        
        this.down('#grid_box').add(this.grid);
    },
    
    _gridBuilderLoaded: function() {
        
        var gridHtml = this.accessibleGridBuilder.getGridHtml();
        
        if (this.accessibleGridPanel) {
            this.remove(this.accessibleGridPanel);
        }
        
//        this.grid = new Ext.container.Container({
//            title: 'User Stories',
//            width: 800,
//            html: gridHtml
//        });        
        
        this.grid = this.accessibleGridBuilder;
        this.down('#grid_box').add(this.grid); 
        this._alert("The user story table is ready");    
    }
});