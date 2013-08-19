/**
  * Gives the user the opportunity to put a string into a box and it constructs a 
  * quick query: 
  *  .. put in a formatted ID
  *  .. put in a details page URL
  *  .. put in straight text
  */
Ext.define('Rally.technicalservices.accessible.queryBox',{
    extend: 'Ext.Container',
    alias: 'widget.tsaccessiblequerybox',
    /**
     * @cfg {String} fieldLabel
     * The label for the field.
     */
     fieldLabel: 'Enter ID or URL',
     /**
      * @cfg {String} humanText
      * The initial human-readable text provided to the box
      */
     humanText: null,
     queryTextField: undefined,
     queryDefineButton: undefined,
     queryClearButton: undefined,
     layout: { type:'hbox' },
     defaults: { margin: 5, padding: 5 },
     
     initComponent: function() {
        var me = this;
        me.callParent();
        me.addEvents(
            /**
             * @event querydefined
             * Fires when the query button has been pushed.
             * @param {Rally.technicalservices.accessible.queryBox} this
             * @param {Rally.data.QueryFilter} The app's guess at a filter based on the entered text
             */
             'querydefined'
        );
        me.queryTextField = me.add({
            xtype:'rallytextfield',
            fieldLabel: me.fieldLabel,
            value: me.humanText
        });
        
        me.queryDefineButton = me.add({
            xtype: 'button',
            text: 'Define and Execute Query',
            buttonLabel : 'Define and Execute Query',
            handler: me._defineQuery,
            scope: me
        });
        
        me.queryClearButton = me.add({
            xtype: 'button',
            text: 'Clear Request',
            buttonLabel : 'Clear Request',
            handler: me._clearQuery,
            scope: me
        });
     },
     _defineQuery: function() {
        this.fireEvent('querydefined',this,this.getValue());
     },
     _clearQuery: function() {
        this.queryTextField.setValue('');
     },
     getValue: function() {
        var text = this.queryTextField.getValue();
        var is_generic = false;
        
        var property = "ObjectID";
        var operator = "=";
        
        var trimmed_text = Ext.String.trim(text);
        
        var check_path_like_re = /\/.*\/\d\d/;
        var check_for_nonnumbers_re = /[^0-9]/;
        var check_for_id_like_pattern_re = /^[a-zA-Z]+\d+$/;
        
        if ( trimmed_text === "" ) {
            return null;
        }
        
        if (check_path_like_re.test(trimmed_text)){
            // likely a URL
            property = "ObjectID";
            trimmed_text = trimmed_text.replace(/.*\//,"");
        } else if ( check_for_id_like_pattern_re.test(trimmed_text)) {
            // likely a FormattedID
            property = "FormattedID";
        } else if ( check_for_nonnumbers_re.test(trimmed_text) ) {
            is_generic = true;
            operator = "contains";
            property = "Name";
        } 
        
        var query = Ext.create('Rally.data.QueryFilter',{
            property:property,
            operator: operator,
            value:trimmed_text
        });
        
        if ( is_generic ) {
            query = query.or(Ext.create('Rally.data.QueryFilter',{
                property:"Description",
                operator: operator,
                value: trimmed_text
            }));
        }
        
        return query;
     },
     getHumanTextValue: function() {
        return this.queryTextField.getValue();
     },
     setHumanTextValue: function(text) {
        this.setValue(text);
     },
     setValue: function(text) {
        this.humanText = text;
        this.queryTextField.setValue(text);
     }
});