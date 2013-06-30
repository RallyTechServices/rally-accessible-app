Ext.define('Rally.technicalservices.accessible.ProjectSelector', {
    // Extending Component in order to get an Ext object
    // We are ultimately building component HTML to add to the DOM
    
    extend: 'Ext.Component',
    requires: ['Rally.data.WsapiDataStore'],
    alias: 'widget.tsprojectselector',
    
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
        componentHtml : null
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
        var optionItemTpl = new Ext.Template('<option value="{0}">{1}</option>\n');
        
        Ext.Array.each(data, function(record) {
            var optionValue = record.get('_ref');
            var optionName = record.get('Name');
            
            itemHtml += optionItemTpl.apply([optionValue, optionName]);
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