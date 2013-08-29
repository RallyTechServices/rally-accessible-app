Ext.define('Rally.technicalservices.accessible.editarea',{
    extend: 'Ext.container.Container',
    alias: 'widget.tsaccessibleeditarea',
    logger: new Rally.technicalservices.logger(),
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
            'buttonclick',
            /**
              * @event alert
              * Fires when the table of children has been loaded
              * @param {Rally.technicalservices.accessible.queryBox} this
              * @param {String} a message to put into the alert area
              */
             'alert',
            /**
              * @event replaceMe
              * Fires when this edit area thinks it should be remade
              * @param {Rally.technicalservices.accessible.editor} this
              * @param {Ext.data.Model} Rally record 
              */
             'replaceMe'
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

        this._isCreateForm = false;
        if ( !this.record ) { 
            this._isCreateForm = true;
        }
        if ( this.record && typeof this.record.get !== 'function') {
            this._isCreateForm = true;
        }
        
        me.logger.log(this,["record",me.record]);
        
        for (var i=0; i<me.fields.length; i++) {
            
            if ( me.record && typeof me.record.get === 'function') {
                value = me.record.get(me.fields[i].dataIndex)
            }
            me.logger.log(this,[me.fields[i].text,value]);
            var editor = me.fields[i].editor;

            var xtype = 'rallytextfield';
            if ( editor && typeof(editor) == "string") {
                xtype = editor;
            } else if ( editor && typeof(editor.xtype) == "string" ) {
                xtype = editor.xtype;
            }
            
            me.logger.log(this,[me._isCreateForm,xtype,editor]);

            if ( me._isCreateForm && xtype === "tsaccessiblefieldcollectionbox" ) {
                // skip this one (we don't want to see collections when creating new items)
                me.logger.log(this,[me._isCreateForm,xtype,editor]);
            } else {
                var thisItem = {
                    record: me.record,
                    xtype: xtype,
                    dataIndex: me.fields[i].dataIndex,
                    fieldLabel: me.fields[i].text,
                    value: value,
                    itemId: "field_" + i,
                    listeners: {
                        alert: function(that, message) {
                            // bubble up event
                            me.fireEvent('alert',that,message);
                        },
                        recordeditclick: function(that,recordToEdit){
                            me.logger.log(me,["click",recordToEdit]);
                            me.fireEvent('replaceMe',me,recordToEdit);
                        },
                        recordaddclick: function(that) {
                            me.fireEvent('replaceMe',me,null);
                        }
                    }
                };
                if ( editor && typeof(editor != "string") ) {
                    Ext.merge(thisItem,editor);
                }
                items.push(thisItem);
            }
        }
        return items;
    },
    initItems : function() {
        this.logger.log(this,"initItems");
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
        this.logger.log(this,["Moving to", next_idx]);
        if ( next_idx > -1 && next_idx < this.items.length ) {
            this.logger.log(this,this.items.getAt(next_idx));
            this.items.getAt(next_idx).focus(select_text);
        }
    },
    getFieldIdByName: function(name){
        var me = this;
        var result = null;
        me.items.each( function(item){
            if ( item.dataIndex === name ) {
                result = item.id;
            }
        });
        
        return result;
    }
});