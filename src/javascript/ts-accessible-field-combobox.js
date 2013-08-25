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
        
        if ( this.field.allowedValueType ) {
            this.valueField = '_ref';
            this.displayField = 'Name';
            if ( this.field.allowedValueType._refObjectName == "User" ) {
                this.displayField = "_refObjectName";
            }
        }
        this.store = Ext.create('Ext.data.Store', {
            fields: [this.valueField, this.displayField],
            data: []
        });
        
        this.store.on('load',this._onStoreLoad, this);
        
        this.on('afterrender', this._onAfterRender, this);
        
        this._populateStore();
    },

    _populateStore: function() {
        var me = this;
        
        this.logger.log(this,["field name:",this.fieldLabel]);
        this.logger.log(this,["field:",this.field]);
        this.logger.log(this,["initial value:",this.value]);
        this.logger.log(this,["displayfield:",this.displayField,"valuefield:",this.valueField]);

        if ( this.field.allowedValueType ) {
            var modelType = this.field.allowedValueType._refObjectName;
//            if ( this.field.allowedValueType._refObjectName == "User" ) {
//                modelType = "Users";
//            }
            Ext.create('Rally.data.WsapiDataStore',{
                model: modelType,
                autoLoad: true,
                limit: 1000,
                context: this.context,
                filters: [{property:'ObjectID',operator:'>',value:0}],
                listeners: {
                    load: function(store,data,success){
                        this._processData(data);
                    },
                    scope: this
                }
            });
        } else if (this.field.attributeDefinition.AttributeType == "BOOLEAN") {
            var true_field = {};
            true_field[me.valueField] = true;
            true_field[me.displayField] = "true";
            var false_field = {};
            false_field[me.valueField] = false;
            false_field[me.displayField] = "false";
            
            Ext.create('Rally.data.custom.Store',{
                data:[false_field,true_field],
                autoLoad: true,
                listeners: {
                    load: function(store,data,success){
                        this._processData(data);
                    },
                    scope:this
                }
            });
        } else {
            this.field.getAllowedValueStore().load({
                callback: function(records, operation, success) {
                    this._processData(records);
                },
                scope: this
            });
        }
    },
    _processData: function(records) {
        var me = this;
        var store = this.store;
        if (!store) {
            return;
        }
        var noEntryValues = [];
        var labelValues = [];

        Ext.Array.each( records, function(record){
            var allowedValue = {};
            if ( record.get(me.valueField) && record.get(me.valueField) !== "" ) {
                allowedValue[me.valueField] = record.get(me.valueField);
                allowedValue[me.displayField] = record.get(me.displayField)
                labelValues.push(allowedValue);
            }
        });
        
        if (this.field.required === false && this.field.attributeDefinition.AttributeType !== "BOOLEAN") {
            var name = "-- No Entry --",
                value = "";
            if (this.field.attributeDefinition.AttributeType.toLowerCase() === 'rating') {
                name = "None";
                value = "None";
            }
            var allowedValue = {};

            allowedValue[me.valueField] = value;
            allowedValue[me.displayField] = name;
            noEntryValues.push(allowedValue);
        }
        store.loadRawData(noEntryValues.concat(labelValues));
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
        
        if (!Ext.isString(new_value) && !Ext.isBoolean(new_value)) {
            new_value = new_value._ref;
        }
        
        if (this.field.attributeDefinition.AttributeType === "BOOLEAN") {
            if (new_value === false){
                new_value = 'false' ;
            }
            if (new_value === true){
                new_value = 'true' ;
            }
        }
        
        Ext.Array.each(options, function(option,idx){
            if (option.value == new_value) {
                selector.selectedIndex = idx;
            }
        });
    }

});
