/*
 * some utilities to help with interacting with fields.  decided to 
 * put here so that editarea isn't dependent on using the model factory
 * 
 * provide a model
 */
Ext.define('Rally.technicalservices.accessible.FieldHelper',{
    extend:'Ext.Component',
    config: {
        /**
         * @cfg {String} modelType (required)
         * Name of the {@link Ext.data.Model Model} associated with this store.
         * The string is used as an argument for {@link Rally.data.ModelFactory.getModel}.
         */
        modelType: null,
        /*
         * @cfg {String} project
         * The reference for the scoped project
         * 
         */
        project:null,
        model: null,
        /*
         * @cfg [{String}] field_order
         * An array of strings defining the order of the first set of fields returned (does not
         * limit them to this list, others will be provided randomly after the field_order.lenghtth one
         * 
         */
        field_order: ['FormattedID','Name','Description','PlanEstimate','ScheduleState','State','Iteration','Release'],
        app: null
    },
    logger: new Rally.technicalservices.logger(),
    forbidden_fields: ["ObjectID","DisplayColor","LatestDiscussionAgeInMinutes",
        "DragAndDropRank","Recycled","TaskActualTotal","TaskEstimateTotal","TaskRemainingTotal","TaskStatus",
        "Subscription","Workspace","Project","RevisionHistory","Blocker","DirectChildrenCount",
        "TaskIndex","Parent","PortfolioItem","Feature","Requirement","WorkProduct",
        "Changesets","Discussion","Tags","Attachments","Defects","Children",
        "Successors","Predecessors","TestCases","Duplicates"],
        
    initComponent: function(){
        this.callParent();
        this.addEvents(
            /**
             * @event load
             * Fires when the model has been acquired and its field defintions loaded
             * @param {Rally.technicalservices.accessible.FieldHelper} this
             */
            'load'
             
        );
        this._getModelFields();
    },
    /**
     * @private
     */
    _getModelFields: function() {
        var me = this;
        Rally.data.ModelFactory.getModel({
            type: me.modelType,
            success: function(model){
                this.model = model;
                me._processFields(model.getNonCollectionFields(), model.getCollectionFields());
            },
            failure: function(){
                me._processFields([]);
            }
        });
    },
    _processFields: function(noncollection_fields,collection_fields) {
        var me = this;
        this.field_columns = [];
        this.field_column_hash = {}; // key is field name
        
        Ext.Array.each(noncollection_fields,function(field){
            var field_type = field.attributeDefinition.AttributeType;
            if ( Ext.Array.indexOf(me.forbidden_fields,field.name) === -1 ) {
                var edit_field = {
                    dataIndex: field.name,
                    text: field.displayName
                };
                
                var dropdown = false;
                if ( field_type === "OBJECT" || field_type === "BOOLEAN") {
                    dropdown = true;
                }
                if ( field.allowedValues.Count > 0 ) {
                    dropdown = true;
                }
                
                if ( Ext.isArray(field.allowedValues) && field.allowedValues.length > 0 ) {
                    dropdown = true;
                }
                if ( dropdown ) {
                    edit_field.editor = {
                        xtype: 'tsaccessiblefieldcombobox',
                        model: me.modelType,
                        context: {
                            project: me.project,
                            projectScopeDown: false,
                            projectScopeUp: false
                        },
                        field: edit_field.dataIndex,
                        fieldLabel: edit_field.text,
                        componentId: 'comboBox-' + edit_field.dataIndex
                    };
                } else {
                    // rich text field/TEXT/text area
                    if ( field_type === "TEXT" ) {
                        edit_field.editor = {
                            field: field.name,
                            fieldLabel: edit_field.text + " rich text field",
                            xtype: 'tsaccessiblehtmleditor',
                            iframeAttrTpl: 'role="aria-textbox" aria-multiline="true"',
                            listeners: {
                                tab: function(ed,shift_key_pressed) {
                                    if ( me.app ) {
                                        me.app._moveToNextItem(ed,shift_key_pressed);
                                    }
                                }
                            }
                        }
                    } else {
                        edit_field.editor = { 
                            xtype:'rallytextfield',
                            field: field.name,
                            fieldLabel: edit_field.text
                        };
                    }
                }
                
                // set readonly where necessary
                edit_field.editor.readOnly = field.readOnly;
                
                me.field_columns.push(edit_field);
                me.field_column_hash[field.name] = edit_field;
                
                // append (required) to required fields
                if ( field.required && !field.readOnly ) {
                    edit_field.editor.fieldLabel += " (required)";
                }
            }
        });
        
        Ext.Array.each(collection_fields,function(field){
            if ( Ext.Array.indexOf(me.forbidden_fields,field.name) === -1 ) {
                console.log(field);
                var edit_field = {
                    dataIndex: field.name,
                    text: field.displayName,
                    readOnly: true
                };
                edit_field.editor = {
                    xtype: 'tsaccessiblefieldcollectionbox',
                    model: me.modelType,
                    context: {
                        project: me.project,
                        projectScopeDown: false,
                        projectScopeUp: false
                    },
                    field: field.name,
                    fieldLabel: field.displayName,
                    componentId: 'collection-' + edit_field.dataIndex
                }
                
                me.field_columns.push(edit_field);
                me.field_column_hash[field.name] = edit_field;
            }
        });
        
        this.field_columns = this._orderList();
        this.fireEvent('load',this);
    },
    /**
     * Returns all the model's fields as hashes that look like column definitions, and
     * include the editor needed for each field.
     *
     * @return an array of hashes that look like {@link Ext.grid.Panel} column configs 
     */
    getFieldsAsColumns: function() {
        return this.field_columns;
    },
    _orderList: function() {
        var me = this;
        var ordered_array = [];
        if (this.field_order) {
            if (Ext.isString(this.field_order)) {
                this.field_order = [this.field_order];
            }
            if ( this.field_order.length > 0) {
                Ext.Array.each(this.field_order,function(name){
                    if (me.field_column_hash[name]) {
                        ordered_array.push(me.field_column_hash[name]);
                    }
                });
                Ext.Array.each(this.field_columns,function(field){
                    if (Ext.Array.indexOf(ordered_array,field) === -1 ) {
                        ordered_array.push(field);
                    }
                });
            } else {
                ordered_array =  this.field_columns;
            }
        } else {
            ordered_array =  this.field_columns;
        }
        return ordered_array;
    },
    /*
     * @param {String} fieldname
     * 
     * Given the name of a field for this modelType, provide the defined column-like hash
     */
    getFieldAsColumn: function(fieldname){
        var field_column = null;
        Ext.Array.each(this.field_columns, function(column){
            if (fieldname === column["dataIndex"]) {
                field_column = column;
                return false;
            }
        });
        return field_column;
        
    }
});