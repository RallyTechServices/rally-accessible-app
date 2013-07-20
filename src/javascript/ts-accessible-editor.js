Ext.define('Rally.technicalservices.accessible.editor',{
    extend: 'Ext.container.Container',
    alias: 'widget.tsaccessibleeditor',
    config: {
         /**
         * @cfg {Ext.data.Model} record
         * The Rally record to edit
         */
        record: null,
        /**
         * @cfg {Array} fields
         * A field configuration definition.  Each item in the array:
         * @cfg {String} Name
         * @cfg {String} dataIndex
         * 
         * for example, 
         * fields: [ { Name: 'Item Name', dataIndex: 'Name' } ]
         */
        fields: []
    },
    renderTpl: "",
    getTemplateArgs: function() {
        if ( this.fields.length == 0 ) {
            this.renderTpl = "No fields supplied";
        }
        
        if ( this.record == null ) {
            this.renderTpl = "No record supplied";
        }
        return {
            fields: this.fields
        }
    },
    beforeRender: function() {
        var me = this;
        me.callParent();
        
        Ext.applyIf(me.renderData, me.getTemplateArgs());
    },
    getFieldObjects: function() {
        var me = this;
        var items = [];
        var value = "";

        for (var i=0; i<me.fields.length; i++) {
            if ( me.record ) {
                value = me.record.get(me.fields[i].dataIndex)
            }
            var thisItem = {
                xtype: 'rallytextfield',
                fieldLabel: me.fields[i].text,
                value: value,
                itemId: "field_" + i
            };
            items.push(thisItem);
        }
        return items;
    },
    
    initItems : function() {
        var me = this,
            items = me.items;

        var field_objects = me.getFieldObjects();
        if ( field_objects.length > 0 && me.record) {
            if ( items ) {
                items = Ext.Array.merge( field_objects, items );
            } else {
                items = field_objects;
            }
        }
        /**
         * The MixedCollection containing all the child items of this container.
         * @property items
         * @type Ext.util.AbstractMixedCollection
         */
        me.items = new Ext.util.AbstractMixedCollection(false, me.getComponentId);

        if (items) {
            if (!Ext.isArray(items)) {
                items = [items];
            }

            me.add(items);
        }
    }
});