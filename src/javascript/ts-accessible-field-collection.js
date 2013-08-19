/**
  * Gives the user the opportunity to put a string into a box and it constructs a 
  * quick query: 
  *  .. put in a formatted ID
  *  .. put in a details page URL
  *  .. put in straight text
  */
Ext.define('Rally.technicalservices.accessible.FieldValueCollection',{
    extend: 'Ext.Container',
    alias: 'widget.tsaccessiblefieldcollectionbox',
    /**
     * @cfg {String} fieldLabel
     * The label for the field.
     */
     fieldLabel: '',
     readOnly: true,
     /**
      * @cfg {String} model
      * The name of the model that has the assigned field
      * 
      * Defaults to 'UserStory'
      */
     model: 'UserStory',
     field: 'Tasks',
     value: 0,
     
     layout: { type:'hbox' },
     defaults: { margin: 5, padding: 5 },
     
     initComponent: function() {
        var me = this;
        me.callParent();
        me.addEvents(
            /**
             * @event
             * Fires when the field's store has been loaded
             * @param {Rally.technicalservices.accessible.FieldValueCollection} this
             */
            'load'
        );
        
        if ( ! /Count of /.test(me.fieldLabel) ) {
            me.fieldLabel = "Count of " + me.fieldLabel;
        }
        me.value = me.getClearValue(me.value);
        
        me.textField = me.add({
            xtype:'rallytextfield',
            fieldLabel: me.fieldLabel,
            readOnly: me.readOnly,
            value: me.value
        });
        
     },
     getValue: function() {
        return this.textField.getValue();
     },
     getClearValue: function(value) {
        var cleaned_value = parseInt(value,10) || 0;
        
        console.log(typeof value);
        
        if ( typeof value === "object" ) {
            cleaned_value = value.Count;
        } 
        
        return cleaned_value;
     },
     setValue: function(value) {
        var cleaned_value = this.getClearValue(value);
        
        this.textField.setValue(cleaned_value);
        this.value = cleaned_value;
     }
});