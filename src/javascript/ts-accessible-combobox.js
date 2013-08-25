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
    logger: new Rally.technicalservices.logger(),
    // Default configuration parameters
    config: {
        store: null,        
        componentId : null,
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
        label: null,
        valueField: '_ref',
         /**
         * @cfg {Object} value
         * A value to initialize this field with.
         */
        value: null
    },
        
    // Constructor
    initComponent: function(){
        this.callParent();
        if ( this.componentId === null ) {
            this.componentId = "comboBox-" + this.valueField;
        }

    },

    renderTpl: [
        '<tpl if="label">',
        '<label for={componentId}>{label}:</label>',
        '</tpl>',
        '<select id={componentId}>',
        '<tpl for="items">',
            '<option value="{valueField}">{displayField}</option>',
        '</tpl>',
        '</select>'
    ],
    
    getTemplateArgs: function() {
        var me = this;
        var data = [];
        if ( me.store !== null ) {
            var records = this.store.getRecords();
            Ext.Array.each(records, function(record){
                data.push({
                    valueField: record.get(me.valueField),
                    displayField: record.get(me.displayField)
                });
            });
        }
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
    },
    
    getValue: function() {
        var my_html = this.getEl().dom;
        var selector = Ext.dom.Query.selectNode('select',my_html);
        var options = Ext.dom.Query.select('option',selector);
        var index = selector.selectedIndex || 0;
        return options[index].value;
    },
    getDisplayValue: function() {
        var my_html = this.getEl().dom;
        var selector = Ext.dom.Query.selectNode('select',my_html);
        var options = Ext.dom.Query.select('option',selector);
        var index = selector.selectedIndex || 0;
        return options[index].text;
    }
});
