/**
 * A combobox that takes a field & model type and displays a dropdown that doesn't have
 * all the cruft that interferes with a Jaws reader.
 * 
 */
 Ext.define('Rally.technicalservices.accessible.combobox.FieldValueCombobox', {
    extend: 'Rally.technicalservices.accessible.Combobox',
    alias: 'widget.tsaccessiblefieldcombobox',
    
    // Default configuration parameters
    config: {
        /**
         * @cfg {String} fieldLabel
         * The fieldname from the model where allowed values can be set
         * 
         * Defaults to 'ScheduleState'
         */
        field: 'ScheduleState',
        /**
         * @cfg {String} model
         * The name of the model that has the assigned field
         * 
         * Defaults to 'UserStory'
         */
        model: 'UserStory',
        componentId : 'fieldComboBox',
        valueField: 'StringValue',
        displayField: 'StringValue'
    },
    
    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent([this.config]);
    },
    initComponent: function(){
        var autoLoad, storeListeners;
        this.addEvents(
            /**
             * @event
             * Fires when the combobox's store has been loaded
             * @param {Rally.technicalservices.accessible.combobox.FieldValueCombobox} this
             */
            'load'
        );
        this.callParent();
        
        this.store = Ext.create('Ext.data.Store', {
            fields: [this.valueField, this.displayField],
            data: []
        });
        
        this.store.on('load',this._onStoreLoad, this);
        
        this.on('afterrender', this._onAfterRender, this);

        if (Ext.isString(this.model)) {
            this._fetchModel();
        } else {
            if (Ext.isString(this.field)) {
                this.field = this.model.getField(this.field);
            }
            this._populateStore();
        }
    },

    _fetchModel: function() {
        Rally.data.ModelFactory.getModel({
            context: this.context,
            type: this.model,
            success: this._onModelRetrieved,
            scope: this
        });
    },
    
    _onStoreLoad: function(store) {
        var me = this;
        me.tpl = me.renderTpl;
        this.update(me.getTemplateArgs());
        if (this.value) {
            this.setValue(this.value);
        }
        this.fireEvent('load', this);
    },

    _onModelRetrieved: function(model) {
        this.model = model;
        this.field = this.model.getField(this.field);
        this._populateStore();
    },

    _populateStore: function() {
        this.field.getAllowedValueStore().load({
            callback: function(records, operation, success) {
                var store = this.store;
                if (!store) {
                    return;
                }
                var noEntryValues = [],
                    labelValues = _.map(
                        _.filter(records, this._hasStringValue),
                        this._convertAllowedValueToLabelValuePair,
                        this
                    );

                if (this.field.required === false) {
                    var name = "-- No Entry --",
                        value = "";
                    if (this.field.attributeDefinition.AttributeType.toLowerCase() === 'rating') {
                        name = "None";
                        value = "None";
                    }
                    noEntryValues.push(this._convertToLabelValuePair(name, value));
                }
                store.loadRawData(noEntryValues.concat(labelValues));
            },
            scope: this
        });
    },
    
    _onAfterRender: function() {
        this._afterRender = true;
        if(this._storeLoaded) {
            this.fireEvent('ready', this);
        }
    },
        
    getTemplateArgs: function() {
        var me = this;
        var data = [];
        if ( me.store !== null ) {
            me.store.each(function(record){
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
    
    setValue: function( new_value ) {
        var my_html = this.getEl().dom;
        var selector = Ext.dom.Query.selectNode('select',my_html);
        var options = Ext.dom.Query.select('option',selector);
        
        Ext.Array.each(options, function(option,idx){
            if (option.value == new_value) {
                selector.selectedIndex = idx;
            }
        });
    }

});
