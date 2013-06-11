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
    
    renderTpl_future: [ 
        '<table role="grid" border="1" cellspacing="1" cellpadding="1" summary="{summary}">',
        '<caption>{caption}</caption>',
        '<thead>',
        '</thead>',
        '<tbody>',
        '</tbody>',
        '</table>'
    ],
    
    renderTpl: [ '{html}'],
    
    getTemplateArgs: function() {
        var html = this._buildComponentHtml();
        return {
            summary: this.title,
            caption: this.caption || this.title,
            html: html
        }
    },
    
    beforeRender: function() {
        var me = this;
        me.callParent();
        
        Ext.applyIf(me.renderData,me.getTemplateArgs());
    },
    
    // get the column names from the column config object which should look like
    // [ { text:'text',dataIndex:'dataIndex' }]
    _getColumnNames: function() {
        var names = [];
        var me = this;
        Ext.Array.each(me.columns, function(column){
            names.push(column.text);
        });
        return names;
    },
    // Uses data in WSAPI Data store to build a Panel containing a table
    _buildComponentHtml: function() {    
        var store = this.store;
        
        if ( store !== null ) {
            var data = store.getRecords();
            
            var itemHtml = '';
            
            // Define render templates for key markup   
            var tableOpenTpl = new Ext.Template('<table id="{0}" role="grid" summary="{1}">');
            var captionTpl = new Ext.Template('<caption>{0}</caption>');
            var theadTpl = new Ext.Template('<thead>{0}</thead>');
            var thColumnHeaderTpl = new Ext.Template('<th id="{0}">{1}</th>');
            var tbodyOpenTpl = new Ext.Template('<tbody id="{0}">');
            var columnWidthTpl = new Ext.Template('<col width="{0}">');
            var trRowHeaderTpl = new Ext.Template('<td id="{0}" role="gridcell" aria-labelledby="{1}" tabindex="0">{2}</th>');
            var rowIdTpl = new Ext.Template('row{0}');
            var rowHeaderAriaLabelledByTpl = new Ext.Template('{0} row{1}'); // {0} = Column Name {1} = row number
            var gridCellIdTpl = new Ext.Template('row{0}-{1}'); // {0} = row number, {1} = Column name
            var trTpl = new Ext.Template('<tr role="row" id="{0}">'); // id="row1"
            var tdHeadersTpl = new Ext.Template('{0} row{1}'); //{0} = Column Name; {1} = Row Number
            var tdTpl = new Ext.Template('<td id="{0}" role="gridcell" headers="{1}" tabindex="0">{2}</td>')
            var trCloseTpl = new Ext.Template('</tr>');
            var tbodyCloseTpl = new Ext.Template('</tbody>');
            var tableCloseTpl = new Ext.Template('</table>');
            
            // Field names of columns in the grid
            var tableColumnNames = this._getColumnNames();

            // Build Table
            itemHtml += tableOpenTpl.apply([this.componentId, this.caption]);
            itemHtml += captionTpl.apply([this.caption]);
            
            // Build Table Header
            var tableHeaderHtml = '';
            for (var i=0; i<tableColumnNames.length; i++) {
                tableHeaderHtml += thColumnHeaderTpl.apply([tableColumnNames[i].toLowerCase(), tableColumnNames[i]]);
            }
            itemHtml += theadTpl.apply([tableHeaderHtml]);
            
            // Table Body
            itemHtml += tbodyOpenTpl.apply(['grid-data']);
            
            // Specify columnWidths
            
            // Build Table Rows
            var rowId = null;
            var columnNameLower = null;
            var gridCellId = null;
            var rowHeaderAriaLabelledBy = null;
            var tdHeaders = null;
            
            for (var j=0; j<data.length; j++) {
                // Row identifier
                rowId = rowIdTpl.apply([j]);
                itemHtml += trTpl.apply([rowId]);
                record = data[j].data;
                
                // Apply column data
                for (i = 0; i<tableColumnNames.length; i++) {                
                    columnNameLower = tableColumnNames[i].toLowerCase();
                    
                    // Apply render templates for Cell ID, Value
                    gridCellId = gridCellIdTpl.apply([j, columnNameLower]);
                    gridCellValue = record[tableColumnNames[i]];
                    
                    // Apply row header if first column
                    // Turns out the row header using aria-labelledby is confusing
                    // and just announces the aria-labelled by value in lieu of anything else
                    // better to go with regular <td> markup including headers (which do get announced)
                    if (i===0) {
                        rowHeaderAriaLabelledBy = rowHeaderAriaLabelledByTpl.apply([columnNameLower, j]);
                        itemHtml += trRowHeaderTpl.apply([gridCellId, rowHeaderAriaLabelledBy, gridCellValue]);
                    }                
                    // Otherwise it's a regular <td> gridcell
                    else {
                        tdHeaders = tdHeadersTpl.apply([columnNameLower, j]);
                        itemHtml += tdTpl.apply([gridCellId, tdHeaders, gridCellValue]);
                    }
                }
                // Close row
                itemHtml += '</tr>';
            }        
            // Close Table
            itemHtml += '</tbody></table>';
            return itemHtml;   
        } else {
            return "";
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