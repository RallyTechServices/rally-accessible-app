Ext.define('Rally.technicalservices.accessible.grid', {
    extend: 'Ext.Component',
    alias: 'widget.tsaccessiblegrid',
    config: {
        caption: null,
        title: 'Grid Title',
        store: null,
        columns: [],
        editListener: null,
        editContainer: null,
        recordEditor: null,
    },
    
    initComponent: function(){
        this.callParent();
    },
    
    renderTpl: [
        '<table border="1" cellspacing="1" cellpadding="1" summary="{summary}">',
        '<caption>{caption}</caption>',
        '<thead><tr>',
        '<tpl for="columns">',
        '<th scope="col">{text}</th>',
        '</tpl>',
        '<th scope="col">Edit</th>',        
        '</tr>',
        '</thead>',
        '<tbody>',
            '<tpl for="data">',
                '<tr>',
                    '<tpl for="parent.columns">',
                        '<tpl if="xindex === 1">',
                            '<th scope="row">',                           
                            '{[parent.data[values.dataIndex]]}',
                            '</th>',
                        '</tpl>',                    
                        '<tpl if="xindex &gt; 1">',
                            '<td>',                          
                            '{[parent.data[values.dataIndex]]}',
                            '</td>',
                        '</tpl>',
                    '</tpl>',
                    '<td><button id="button-{#}">Edit Record</button></td>',
                '</tr>',
            '</tpl>',
        '</tbody>',
        '</table>'
    ],
    
    renderTpl_past: [ '{html}'],
    
    getTemplateArgs: function() {        
        return {
            summary: this.title,
            caption: this.caption || this.title,
            columns: this.columns,
            data: this.store.getRecords()
        }
    },
    
    beforeRender: function() {
        var me = this;
        me.callParent();        
        Ext.applyIf(me.renderData, me.getTemplateArgs());
    },

    afterRender: function() {
        var me = this;
        for (var i=0; i<this.store.getRecords().length; i++) {
            Ext.get('button-' + i).addListener('click', me._editButtonClickHandler, this);
        }
    },

    // Edit button: calls the event handler passed in via config
    _editButtonClickHandler: function(extEventObject, buttonEl, eOpts) {
        var buttonId = buttonEl.id;
        var rowIndex = buttonId.replace(/^\D+/g, '');
        var recordToEdit = this.store.getAt(rowIndex).data;

        if (Ext.isFunction(this.editListener.editButtonClicked)) {
            this.editListener.editButtonClicked.call(this, recordToEdit);
        }           
    }
    
//    onRender: function(){
//        var me = this;
//        this.callParent(arguments);
//        Ext.create('Ext.container.Container',{
//            html: 'hi!',
//            renderTo: me.renderTo
//        });
//    }
});