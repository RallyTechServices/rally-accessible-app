Ext.define('AccessibilityApp.ProjectSelector', {
    // Extending Component in order to get an Ext object
    // We are ultimately building component HTML to add to the DOM
    
    extend: 'Ext.Component',
    requires: ['Rally.data.WsapiDataStore'],
    alias: 'widget.projectselector',
    
    // Default configuration parameters
    config: {
        modelType: 'Project',        
        storeFilters: [
            {
                property: 'State',
                value: 'Open'
            }
        ],
        storeSorters: [
            {
                property: 'Name',
                direction: 'ASC'
            }
        ],
        componentId : 'projectSelector',
        componentHtml : null,
    },
    
    // Constructor    
    constructor: function(config) {
        
        this.mergeConfig(config);
        
        Ext.create('Rally.data.WsapiDataStore', {
            model: this.modelType,
            autoLoad: true,
            fetch: ['ObjectID', 'Name'],
            listeners: {
                load: this._onStoreLoaded,
                scope: this
            },
            filters: this.storeFilters,
            sorters: this.storeSorters
        });        
        
        this.callParent([this.config]);        
    },    
    
    // Called when WsapiDataStore is finished loading    
    _onStoreLoaded: function(store, data) {
        this.wsapiStore = store;
        this._buildComponentHtml(store, data);
    },
    
    // Some default HTML content
    _buildDefaultHtml: function() {
        return '<select><option value="/project/123456789">No Projects Loaded From Rally</option></select>';        
    },
    
    // Uses data in WSAPI Data store to build an HTML <select> component
    _buildComponentHtml: function(store, data) {
        
        var itemHtml = '';
        Ext.Array.each(data, function(record) {
            itemHtml += '<option value="' + record.get('_ref') + '">';
            itemHtml += record.get('Name');
            itemHtml += '</option>\n';
        });
        this.componentHtml = itemHtml;
        
        this._componentReady();     
    },
        
    // Calls the ready handler passed in via config
    _componentReady: function() {    
        if (this.componentHtml && Ext.isFunction(this.config.listeners.ready)) {
            this.config.listeners.ready.call(this.config.listeners.scope);
        }           
    }
});

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    projectSelectorComponent : null,
    projectSelector: null,
    grid: null,

    launch: function() {
        
        /* this.add({
            xtype: 'rallycombobox',
            allowBlank: false,
            editable: false,
            triggerAction: 'all',
            typeAhead: false,
            hiddenName: 'Select Project',
            width: 250,
            listWidth: 250,
            storeConfig: {
                autoLoad: true,
                model: 'Project',
                sorters: [
                    {
                        property: 'Name',
                        direction: 'Asc'
                    }
                ]
            }                        
        }); */
        
        projectSelectorComponent = Ext.create('AccessibilityApp.ProjectSelector', {
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
                        filters: [
                            {
                                property: 'Project',
                                operator: '=',
                                value: selectedProjectRef
                            },
                            {
                                property: 'ScheduleState',
                                operator: '=',
                                value: 'Defined'
                            }
                        ]
                    }
                });
            },
            scope: this
        });        
    }
});
