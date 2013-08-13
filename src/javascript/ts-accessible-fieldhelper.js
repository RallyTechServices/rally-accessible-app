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
        model: null
    },
    forbidden_fields: ["ObjectID","DisplayColor","LatestDiscussionAgeInMinutes",
        "DragAndDropRank","Recycled","TaskActualTotal","TaskEstimateTotal","TaskRemainingTotal","TaskStatus",
        "Subscription","Workspace","Project","RevisionHistory","Blocker","DirectChildrenCount",
        "Parent","PortfolioItem","Feature"],
        
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
                me._processFields(model.getNonCollectionFields());
            },
            failure: function(){
                me._processFields([]);
            }
        });
    },
    _processFields: function(noncollection_fields) {
        console.log(noncollection_fields);
        var me = this;
        this.field_columns = [];
        
        Ext.Array.each(noncollection_fields,function(field){
            var field_type = field.attributeDefinition.AttributeType;
            console.log(field.name,field_type,field.allowedValues.Count);
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
                console.log(field.name, field.allowedValues, Ext.isArray(field.allowedValues));
                
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
                            fieldLabel: field.displayName + " rich text field",
                            xtype: 'tsaccessiblehtmleditor',
                            iframeAttrTpl: 'role="aria-textbox" aria-multiline="true"',
                            listeners: {
                                tab: function(ed,shift_key_pressed) {
                                    me._moveToNextItem(ed,shift_key_pressed);
                                }
                            }
                        }
                    } else {
                        edit_field.editor = { 
                            xtype:'rallytextfield',
                            field: field.name
                        };
                    }
                }
                
                // set readonly where necessary
                edit_field.editor.readOnly = field.readOnly;
                
                me.field_columns.push(edit_field);
            }
        });
        this.fireEvent('load',this);
    },
    /**
     * Returns all the model's fields as hashes that look like column definitions, and
     * include the editor needed for each field.
     *
     * @return an array of hashes that look like {@link Ext.grid.Panel} column configs 
     */
    getFieldsAsColumns: function() {
        console.log(this.field_columns);
        return this.field_columns;
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