Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelectorComponent : null,
    projectSelector: null,
    grid: null,

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
        var selectedProjectRef = projectSelector.getEl().dom.value;
        
        // Clear out existing grid if present
        if (this.grid) {
            this.remove(this.grid);
        }

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
        });        
    }
});
