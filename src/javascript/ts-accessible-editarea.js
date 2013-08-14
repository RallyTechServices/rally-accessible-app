Ext.define('Rally.technicalservices.accessible.editarea',{
    extend: 'Ext.container.Container',
    alias: 'widget.tsaccessibleeditarea',
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
        fields: [],
        /**
         * @cfg {Object/Object[]} buttons
         * Convenience config used for adding buttons docked to the bottom of the panel. 
         *
         *     buttons: [
         *       { text: 'Button 1' }
         *     ]
         *     
         * Clicking a button fires the buttonclick event
         */
        buttons: []
    },
    initComponent: function() {
        this.callParent();
        this.addEvents(
            /**
             * @event buttonclick
             * Fires when one of the buttons is clicked
             * @param {Rally.technicalservices.accessible.editor} this
             * @param {Ext.data.Model} Rally record 
             * @param {Ext.button} The button that was clicked
             */
            'buttonclick'
        );
    },
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
            if ( me.record && typeof me.record.get === 'function') {
                value = me.record.get(me.fields[i].dataIndex)
            }
            me._log(["value",value]);
            
            var xtype = 'rallytextfield';
            if ( me.fields[i].editor && typeof(me.fields[i].editor) == "string") {
                xtype = me.fields[i].editor;
            }
            var thisItem = {
                xtype: xtype,
                fieldLabel: me.fields[i].text,
                value: value,
                itemId: "field_" + i
            };
            if ( me.fields[i].editor && typeof(me.fields[i].editor != "string") ) {
                Ext.merge(thisItem,me.fields[i].editor);
            }
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
            
            Ext.Array.each(me.buttons, function(button){
                var basic_definition = {
                    xtype: 'button',
                    text: 'No Label Supplied',
                    handler: function() { 
                        me.fireEvent('buttonclick', me, me.record, this); 
                    },
                    scope: this
                };
                
                items.push(Ext.merge(basic_definition,button));
            });
            
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
    },
    setFocusToItemNumber: function(next_idx,select_text){
        this._log(["Moving to", next_idx]);
        if ( next_idx > -1 && next_idx < this.items.length ) {
            this._log(this.items.getAt(next_idx));
            this.items.getAt(next_idx).focus(select_text);
        }
    },
    _log: function(msg) {
        window.console && console.log( this.self.getName(),' -- ', msg );  
    }
});