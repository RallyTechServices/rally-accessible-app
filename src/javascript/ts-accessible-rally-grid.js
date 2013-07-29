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
        columns: []
    },
    
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
        '<table border="1" cellspacing="1" cellpadding="1" summary="{summary}">',
        '<caption>{caption}</caption>',
        '<thead><tr>',
        '<tpl for="columns">',
        '<th scope="col">{text}</th>',
        '</tpl>',
        '<th scope="col">Edit</th>',
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
                    '<td><button id="button-{#}">Edit{data.EditText}</button></td>',
                '</tr>',
            '</tpl>',
        '</tbody>',
        '</table>'
    ],
    
    renderTpl_past: [ '{html}'],
    
    getTemplateArgs: function() {
        var data = [];
        var me = this;
        if (this.store) {
            data = this.store.getRecords();
        }
        if ( data.length == 0 ) {
            this.renderTpl = "No records found";
        }
        Ext.Array.each(data, function(datum){
            datum.set('EditText',"");
            if (me.editFieldName && datum.get(me.editFieldName) ) {
                var text = datum.get(me.editFieldName);
                if ( text.length > 10 ) {
                    text = text.substring(0,9) + ' ...';
                }
                datum.set('EditText',' ' + text);
            }
        });
        
        return {
            summary: this.title,
            caption: this.caption || this.title,
            columns: this.columns,
            data: data
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
        if ( this.store ) {
            for (var i=0; i<this.store.getRecords().length; i++) {
                Ext.get('button-' + i).addListener('click', me._editButtonClickHandler, this);
            }
            var first_button = Ext.get('button-0');
            if ( first_button ) {
                first_button.focus();
            }
        }
    },
    
    _editButtonClickHandler: function(extEventObject, buttonEl, eOpts) {
        var buttonId = buttonEl.id;
        var rowIndex = parseInt( buttonId.replace(/^\D+/g, ''), 10 );
        var recordToEdit = this.store.getAt(rowIndex);
        this.fireEvent('recordeditclick', this, recordToEdit);
     
    }
   
});