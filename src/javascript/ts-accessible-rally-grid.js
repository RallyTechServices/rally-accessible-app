Ext.define('Rally.technicalservices.accessible.grid', {
    extend: 'Ext.Component',
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
        '<table border="1" cellspacing="1" cellpadding="1" summary="{summary}">',
        '<caption>{caption}</caption>',
        '<thead><tr>',
        '<tpl for="columns">',
        '<th scope="col">{text}</th>',
        '</tpl>',
        '</tr></thead>',
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
    }
    
});