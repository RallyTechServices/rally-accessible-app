Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelectorComponent : null,
    projectSelector: null,
    grid: null,
    accessibleGridBuilder: null,
    accessibleGridPanel: null,

    launch: function() {        
        
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
        
        this.add(projectSelector);
        
        this.add({
            xtype: 'button',
            text: 'Get Stories',
            buttonLabel : 'Get Stories',
            handler: this._getStories,
            scope: this
        });        
    },
    
    
    // Loads/refreshes grid with subset of Stories from selected project
    _getStories: function() {
        
        // Get the ref of the selected project
        var selectedProjectRef = projectSelector.getEl().dom.value;
        
        // Clear out existing grid if present
        if (this.grid) {
            this.remove(this.grid);
        }
        
        // ModelFactory Section: Incorporates a standard Rally grid
        /*
        Rally.data.ModelFactory.getModel({
            type: 'UserStory',
            success: function(model) {                
                this.grid = this.add({
                    xtype: 'rallygrid',
                    model: model,
                    columnCfgs: [
                        'FormattedID',
                        'Name',
                        'Owner'
                    ],
                    storeConfig: {
                        context: {
                            project: selectedProjectRef,
                            projectScopeUp: false,
                            projectScopeDown: false
                        }
                    }
                });
            },
            scope: this
        }); */
        
        // accessibleGridBuilder Section: Incorporates a custom "accessible" grid
        
        accessibleGridBuilder = Ext.create('Rally.technicalservices.accessible.grid', {
            componentId : 'accessible-story-grid',
            caption: 'Accessible Rally Grid',
            type: 'UserStory',
            fetch: ['FormattedID','Name', 'ScheduleState'],
            columnWidths: [200, 300, 300],
            storeContext: {
                project: selectedProjectRef,
                projectScopeUp: false,
                projectScopeDown: false
            },
            listeners: {
                ready: this._gridBuilderLoaded,
                scope: this
            },
            renderTo: Ext.getBody().dom
        });
        
    },
    
    _gridBuilderLoaded: function() {
        
        var gridHtml = accessibleGridBuilder.getGridHtml();
        
        if (this.accessibleGridPanel) {
            this.remove(this.accessibleGridPanel);
        }
        
        accessibleGridPanel = new Ext.panel.Panel({
            renderTo: Ext.getBody(),
            title: 'User Stories',
            width: 800,
            html: gridHtml
        });        
        
        this.add(accessibleGridPanel);  
    }
});
