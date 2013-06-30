Ext.define('Rally.technicalservices.accessible.Combobox', {
    
    extend: 'Ext.Component',
    alias: 'widget.tsaccessiblecombobox',
    
    // Default configuration parameters
    config: {
        store: null,        
        componentId : 'comboBox',
    },
        
    // Constructor
    initComponent: function(){
        this.callParent();
    },

    renderTpl: [
        '<select id={componentId}>',
        '<tpl for="data">',
            '<option value="{data._ref}">{data.Name}</option>',
        '</tpl>',
        '</select>'
    ],
    
    getTemplateArgs: function() {
        data = this.store.getRecords();
        return {
            componentId: this.componentId,
            data: this.store.getRecords()
        }
    },

    beforeRender: function() {
        var me = this;
        me.callParent();
        Ext.applyIf(me.renderData, me.getTemplateArgs());
    }
});
