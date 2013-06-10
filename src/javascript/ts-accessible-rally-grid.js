Ext.define('Rally.technicalservices.accessible.grid', {
    /**
     * Panel containing an Accessible grid
     *
     *     @example
     *     Ext.create('Rally.technicalservices.accessible.grid', {
     *         componentId : 'my-grid',
     *         caption: 'Accessible Rally Grid',
     *         type: 'User Story',
     *         fetch: ['ObjectID','FormattedID','Name'],
     *         storeFilters: [
     *                {
     *                    property: 'State',
     *                    value: 'Open'
     *                }
     *         ],
     *         storeSorters: [
     *                {
     *                     property: 'Name',
     *                     direction: 'ASC'
     *                }
     *         ],
     *         storeContext: {
     *              project: '/project/12345678910',
     *              projectScopeUp: false,
     *              projectScopeDown: false
     *         },
     *         renderTo: Ext.getBody().dom
     *     });
     */
    
    extend: 'Ext.Panel',
    requires: ['Rally.data.WsapiDataStore'],
    alias: 'widget.tsaccessiblegrid',
    
    // Default Configuration parameters
    config: {
        title: 'Rally Accessible Grid',
        width: 800,
        html: '<p>World!</p>',
        componentId: 'ts-accessible-grid',
        caption: 'Rally Accessible Grid',
        type: null,
        wsapiStore: null,
        fetch: ['ObjectID','FormattedID','Name'],
        storeFilters: [{}],
        storeSorters: [
            {
                property: 'Name',
                direction: 'ASC'
            }
        ],
    },
    
    // Constructor    
    constructor: function(config) {        
        
        this.mergeConfig(config);
           
        Ext.create('Rally.data.WsapiDataStore', {
            model: this.type,
            autoLoad: true,
            fetch: this.fetch,
            listeners: {
                load: this._onStoreLoaded,
                scope: this
            },
            sorters: this.storeSorters
        });
        
        this.callParent([this.config]);        
    },
    
    // Called when WsapiDataStore is finished loading    
    _onStoreLoaded: function(store, data) {
        this.wsapiStore = store;
        this._buildComponentHtml(store, data);
    },
    
    // Uses data in WSAPI Data store to build a Panel containing a table
    _buildComponentHtml: function(store, data) {        
        
        var itemHtml = '';
        
        // Define render templates for key markup   
        var tableOpenTpl = new Ext.Template('<table id="{0} role="grid" summary="{1}>');
        var captionTpl = new Ext.Template('<caption>{0}</caption>');
        var theadTpl = new Ext.Template('<thead>{0}</thead>');
        var thColumnHeaderTpl = new Ext.Template('<th id="{0}">{1}</th>');
        var tbodyOpenTpl = new Ext.Template('<tbody id="{0}">');
        var trRowHeaderTpl = new Ext.Template('<th id="{0}" role="gridcell" aria-labelledby="{1}" tabindex="0">{2}</th>');
        var rowIdTpl = new Ext.Template('row{0}');
        var rowHeaderAriaLabelledByTpl = new Ext.Template('{0} r{1}'); // {0} = Column Name {1} = row number
        var gridCellIdTpl = new Ext.Template('row{0}-{1}'); // {0} = row number, {1} = Column name
        var trTpl = new Ext.Template('<tr role="row" id="{0}">'); // id="row1"
        var tdHeadersTpl = new Ext.Template('{0} row{1}'); //{0} = Column Name; {1} = Row Number
        var tdTpl = new Ext.Template('<td id="{0}" role="gridcell" headers="{1}" tabindex="0">{2}</td>')
        var trCloseTpl = new Ext.Template('</tr>');
        var tbodyCloseTpl = new Ext.Template('</tbody>');
        var tableCloseTpl = new Ext.Template('</table>');
        
        // Field names of columns in the grid
        var tableColumnNames = this.fetch;
        
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
                gridCellId = gridCellIdTpl.apply([i, columnNameLower]);
                gridCellValue = record[tableColumnNames[i]];
                
                // Apply row header if first column
                if (i===0) {
                    rowHeaderAriaLabelledBy = rowHeaderAriaLabelledByTpl.apply([columnNameLower, i]);
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
        this.componentHtml = itemHtml;   
        this._componentReady();     
    },
        
    // Calls the ready handler passed in via config
    _componentReady: function() {    
        if (this.componentHtml && Ext.isFunction(this.config.listeners.ready)) {
            this.config.listeners.ready.call(this.config.listeners.scope);
        }           
    }
});