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
    logger: new Rally.technicalservices.logger(),
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
     record: null,
     
     layout: { type:'hbox' },
     defaults: { margin: 5, padding: 5 },
     
     initComponent: function() {
        var me = this;
        me.callParent();
        me.addEvents(
             /**
              * @event alert
               * Fires when the table of children has been loaded
              * @param {Rally.technicalservices.accessible.queryBox} this
              * @param {String} a message to put into the alert area
              */
             'alert',
             /**
              * @event recordeditclick
              * Fires when an edit button on one of the table lines is clicked
              * @param {Rally.technicalservices.accessible.grid} the grid (bubbles up from the grid)
              * @param {Ext.data.Model} Rally record for the selected row
              */
             'recordeditclick',
             /**
              * @event recordaddclick
              * Fires when the add button is clicked
              * @param {Rally.ui.Button} The button
              */
             'recordaddclick'
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

        me.viewButton = me.add({
            xtype: 'button',
            text: 'View ' + me.field,
            buttonLabel : 'View ' + me.field,
            handler: me._viewButtonPressed,
            scope: me
        });
        
        me.addButton = me.add({
            xtype: 'button',
            text: 'Add ' + me.field,
            buttonLabel : 'Add ' + me.field,
            handler: me._addButtonPressed,
            scope: me
        });
     },
     _table_columns: {
        "Task":  [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'State', dataIndex:'State'}
            ],
        "HierarchicalRequirement":  [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'State', dataIndex:'ScheduleState'}
            ],
        "Defect":  [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'State', dataIndex:'State'}
            ]
        
     },
     _addButtonPressed: function(button) {
        this.fireEvent('recordaddclick',button);
     },
     _viewButtonPressed: function(button) {
        var me = this;
        if ( me.getValue() > 0 ) {
            var sub_type = me.record.get(me.field)._type;
            var store = me.record.getCollection(me.field);
            
            if ( this.grid ) { this.grid.destroy(); }
            
            store.load({
                callback: function(records,operation,success) {
                    me.grid = Ext.create('Rally.technicalservices.accessible.grid',{
                        title: 'Table of ' + sub_type + "s",
                        caption: 'Table of ' + sub_type + "s",
                        store: store,
                        showEdit: true,
                        prefix: me.field,
                        editFieldName: 'Name',
                        caption: 'Table of ' + me.fieldLabel,
                        columns: me._table_columns[sub_type],
                        listeners: {
                            scope: me,
                            afterrender: function() {
                                //
                                me.fireEvent('alert',this, "The table of " + me.fieldLabel + " is ready");
                                me.grid.focus();
                            },
                            recordeditclick: function(g, recordToEdit) {
                                me.logger.log(me,["click",recordToEdit]);
                                me.fireEvent('recordeditclick',me.grid,recordToEdit);
                            }
                        }
                    });
                    me.add(me.grid);
                }
            });
            
        }
     },
     getValue: function() {
        return this.textField.getValue();
     },
     getClearValue: function(value) {
        var cleaned_value = parseInt(value,10) || 0;
        
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