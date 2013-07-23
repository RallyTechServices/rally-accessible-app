/**
 * A combobox that takes a store and displays a dropdown that doesn't have
 * all the cruft that interferes with a Jaws reader.
 * 
 * The drop-down options display name and provide the Rally ref.
 * 
 */
 Ext.define('Rally.technicalservices.accessible.Combobox', {
    extend: 'Ext.Component',
    alias: 'widget.tsaccessiblecombobox',
    
    // Default configuration parameters
    config: {
        store: null,        
        componentId : 'comboBox',
        /**
         * @cfg {String}
         * The underlying data field name to bind to this ComboBox.
         * 
         * Defaults to 'Name'
         */
        displayField: 'Name',
        /**
         * @cfg {String} label
         * String to display to the left of the combobox
         */
        label: null
    },
        
    // Constructor
    initComponent: function(){
        this.callParent();
    },

    renderTpl: [
        '<tpl if="label">',
        '<label for={componentId}>{label}:</label>',
        '</tpl>',
        '<select id={componentId}>',
        '<tpl for="items">',
            '<option value="{_ref}">{displayField}</option>',
        '</tpl>',
        '</select>'
    ],
    
    getTemplateArgs: function() {
        var me = this;
        var data = [];
        var records = this.store.getRecords();
        Ext.Array.each(records, function(record){
            data.push({
                _ref: record.get('_ref'),
                displayField: record.get(me.displayField)
            });
        });
        return {
            componentId: this.componentId,
            items: data,
            label: this.fieldLabel
        }
    },

    beforeRender: function() {
        var me = this;
        me.callParent();
        Ext.applyIf(me.renderData, me.getTemplateArgs());
    }
});
