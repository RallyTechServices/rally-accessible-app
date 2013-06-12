Ext.define('Rally.technicalservices.accessible.grid', {
    extend: 'Ext.Component',
    requires: ['Rally.data.WsapiDataStore'],
    alias: 'widget.tsaccessiblegrid',
    config: {
        caption: null,
        title: 'Grid Title',
        store: null,
        columns: []
    },
    
    initComponent: function(){
        this.callParent();
    },
    
    renderTpl: [ 
        '<table role="grid" border="1" cellspacing="1" cellpadding="1" summary="{summary}">',
        '<caption>{caption}</caption>',
        '<thead><tr>',
        '<tpl for="columns">',
        '<th id="{dataIndex}">{text}</th>',
        '</tpl>',
        '</tr></thead>',
        '<tbody id="grid-data">',
            '<tpl for="data">',
            '<tr role="row" id="row-{[values.data["ObjectID"]]}">',
                '<tpl for="parent.columns">',
                '<td role="gridcell" aria-labelledby="row-{[parent.data["ObjectID"]]} {dataIndex}" tabindex="0" id="row-{[parent.data["ObjectID"]]}-{dataIndex}">',
                    '{[parent.data[values.dataIndex]]}',
                '</td>',
                '</tpl>',
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
        
        Ext.applyIf(me.renderData,me.getTemplateArgs());
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