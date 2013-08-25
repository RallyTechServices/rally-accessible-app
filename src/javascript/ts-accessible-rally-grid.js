Ext.define('Rally.technicalservices.accessible.grid', {
    extend: 'Ext.container.Container',
    alias: 'widget.tsaccessiblegrid',
    config: {
         /**
         * @cfg {String} 
         * Embedded into the table definition as the caption
         * 
         * Defaults to the value of title
         */
        caption: null,
         /**
         * @cfg {String} title
         * Embedded into the table definition as the summary
         * 
         * Defaults to 'Grid Title'
         */
        title: 'Grid Title',
        /**
         * @cfg {String} editFieldName
         * When an edit button is displayed, value from this field on the record will
         * follow 'Edit'.  For example, set to 'FormattedID' for the button to say, 'Edit US72'
         * 
         */
        editFieldName: null,
        /**
         * @cfg {@Rally.data.WsapiDataStoreView} Must be a WsapiDataStore
         * 
         */
        store: null,
        /**
         * @cfg {Array}
         * Accepts {@link Ext.grid.Panel} column configs
         */
        columns: [],
        /**
         * @cfg {String} prefix
         * A prefix to add to the id of each button in the table
         */
        prefix: null,
        /**
          * @cfg {Boolean} showEdit
          * Whether to show the column with edit buttons
          * 
          * Defaults to true
          */
        showEdit: true
    },
    logger: new Rally.technicalservices.logger(),
    initComponent: function(){
        this.callParent();
        this.addEvents(
            /**
             * @event recordeditclick
             * Fires when the edit button for a record is clicked
             * @param {Rally.technicalservices.accessible.grid} this
             * @param {Ext.data.Model} Rally record for the selected row
             */
            'recordeditclick'
        );
    },
    
    renderTpl: [
        '<table border="1" cellspacing="1" cellpadding="1" summary="{summary}" id="table-{tableId}" tabindex="0">',
        /* '<caption>{caption}</caption>', */
        '<thead><tr>',
        '<tpl for="columns">',
        '<th scope="col">{text}</th>',
        '</tpl>',
        '<tpl if="showEdit">',
        '<th scope="col">Edit</th>',
        '</tpl>',
        '</tr></thead>',
        '<tbody>',
            '<tpl for="data">',
                '<tr>',
                    '<tpl for="parent.columns">',
                        '<tpl if="xindex === 1">',
                            '<th scope="row">',
                            '{[parent.data[values.dataIndex] ? parent.data[values.dataIndex] : "..." ]}',
                            '</th>',
                        '</tpl>',
                        '<tpl if="xindex &gt; 1">',
                            '<td>',
                            '{[parent.data[values.dataIndex] ? parent.data[values.dataIndex] : "" ]}',
                            '</td>',
                        '</tpl>',
                    '</tpl>',
                    '<tpl if="parent.showEdit">',
                    '<td><button id="button-{data.ObjectID}-{#}">Edit{data.EditText}</button></td>',
                    '</tpl>',
                '</tr>',
            '</tpl>',
        '</tbody>',
        '</table>'
    ],
    
    renderTpl_past: [ '{html}'],
    
    getTemplateArgs: function() {
        var me = this;
        var data = [];
        var me = this;
        if (this.store) {
            data = this.store.getRecords();
            this.logger.log(this,["table data",data]);
            Ext.Array.each(data, function(datum){
                if ( datum.get('Tasks') ) {
                    var count_of_tasks = datum.get('Tasks').Count || 0;
                    me.logger.log(this,count_of_tasks);
                    datum.set('Tasks',"" + count_of_tasks);
                }
            });
        }
        if ( data.length == 0 ) {
            this.renderTpl = "No records found";
        }
        Ext.Array.each(data, function(datum){
            datum.set('EditText',"");
            datum.set('TitleText',"");
            if (me.editFieldName && datum.get(me.editFieldName) ) {
                var text = datum.get(me.editFieldName);
                datum.set('TitleText'," " + text);
                text = "<span style='position: absolute !important;left: -10000px;overflow: hidden;'>"+ text + "</span>";
                
                datum.set('EditText',' ' + text);
            }
        });
        
        return {
            summary: this.title,
            caption: this.caption || this.title,
            columns: this.columns,
            data: data,
            showEdit: this.showEdit,
            tableId: this.id
        }
    },
    /*
     * return number of items in the grid
     */
    getCount: function() {
        var count = 0;
        if ( this.store ) {
            count = this.store.getCount();
        }
        return count;
    },
    beforeRender: function() {
        var me = this;
        me.callParent();
        
        Ext.applyIf(me.renderData, me.getTemplateArgs());
    },
    
    afterRender: function() {
        var me = this;
        if ( this.store && this.showEdit ) {
            var records = this.store.getRecords();
            for (var i=0; i<records.length; i++) {
                var unique_id = "";
                if (records[i].get('ObjectID')) {
                    unique_id = records[i].get('ObjectID');
                }
                this.logger.log(this,"Adding Edit button for " + i + " (" + unique_id + ")");
                Ext.get('button-' + unique_id + "-" + i).addListener('click', me._editButtonClickHandler, this, records[i]);
            }
            
            var embedded_table = Ext.get("table-" + this.id);
            if (embedded_table) {
                embedded_table.focus();
            }
            
            var html_node = this.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            if ( buttons.length > 0 ) {
                buttons[0].focus();
            }
        }
    },
    focus: function() {
        var embedded_table = Ext.get("table-" + this.id);
        if (embedded_table) {
            embedded_table.focus();
        }
    },
    _editButtonClickHandler: function(extEventObject, buttonEl, record, eOpts) {
        this.logger.log(this,"fired _editButtonClickHandler");
        this.fireEvent('recordeditclick', this, record);
     
    }
   
});