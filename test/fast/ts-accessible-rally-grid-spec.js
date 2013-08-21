describe("Accessible Grid", function(){
    var grid;
    describe("When testing simple configuration", function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (grid) { grid.destroy(); }
        });
        
        it("is happy with defaults", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {});
            expect(grid).not.toBe(null);
            expect(grid.store).toBe(null);
            var template_args = grid.getTemplateArgs();
            expect(template_args.summary).toEqual("Grid Title");
            expect(template_args.caption).toEqual("Grid Title");
        });
        it("accepts simple config options",function(){
            var columns = [
                {text:'ID', dataIndex:'FormattedID'},
                {text:'Name', dataIndex:'Name'},
                {text:'Schedule State', dataIndex:'ScheduleState'}
            ];
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                title: 'A new title',
                caption: 'A new caption',
                columns: columns,
                renderTo: "componentTestArea"
            });

            var template_args = grid.getTemplateArgs();
            expect(template_args.summary).toEqual("A new title");
            expect(template_args.caption).toEqual("A new caption");
            expect(template_args.columns).toEqual(columns);
        });
        it("reports 'no records' when no records found",function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea"
            });
            var html_node = grid.getEl().dom;
            expect(html_node.innerHTML).toEqual('No records found');
        });
    });
    describe("When given a store", function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (grid) { grid.destroy(); }
        });
        
        it("should return a number of items in the grid", function(){
           grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'},
                    {text:'Name', dataIndex:'Name'}
                ]
            });
            expect(grid.getCount()).toEqual(2);
        });
        it("should create a grid with columns defined by 'columns'", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'},
                    {text:'Name', dataIndex:'Name'}
                ]
            });
            
            var html_node = grid.getEl().dom;
            var table_node = html_node.firstChild;
            expect(table_node.getAttribute('summary')).toEqual('Grid Title');
            var rows = Ext.dom.Query.select('TR',table_node);
            expect(rows.length).toEqual(3); // header + two data rows
            
            var header_cells = Ext.dom.Query.select('TH',rows[0]);
            expect(header_cells.length).toEqual(3); 
            expect(header_cells[0].innerHTML).toEqual('Ref');
            expect(header_cells[0].getAttribute('scope')).toEqual('col');
            expect(header_cells[1].innerHTML).toEqual('Name');
            expect(header_cells[1].getAttribute('scope')).toEqual('col');
            expect(header_cells[2].innerHTML).toEqual('Edit');
            expect(header_cells[2].getAttribute('scope')).toEqual('col');
            
            var data_cells = rows[1].childNodes;
            expect(data_cells[0].nodeName).toEqual('TH');
            expect(data_cells[0].getAttribute('scope')).toEqual("row");
            expect(data_cells[0].innerHTML).toEqual('/mock/12345');
            expect(data_cells[1].nodeName).toEqual('TD');
            expect(data_cells[1].innerHTML).toEqual('first');
            expect(Ext.dom.Query.select('button',data_cells[2]).length).toEqual(1);

            
        });
        it("should create a grid that shows blank when unknown dataIndex", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'},
                    {text:'Name', dataIndex:'NOT_HERE'}
                ]
            });
            
            var html_node = grid.getEl().dom;           
            var rows = Ext.dom.Query.select('TR',html_node);
            expect(rows.length).toEqual(3); // header + two data rows
            
            var data_cells = rows[1].childNodes;
            expect(data_cells[0].nodeName).toEqual('TH');
            expect(data_cells[0].getAttribute('scope')).toEqual("row");
            expect(data_cells[0].innerHTML).toEqual('/mock/12345');
            expect(data_cells[1].nodeName).toEqual('TD');
            expect(data_cells[1].innerHTML).toEqual('');
            
        });
        
        it("should put only Edit on the edit buttons when no field name supplied", function(){
                        grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'}
                ]
            });
            var html_node = grid.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(2);
            expect(buttons[0].innerHTML).toEqual('Edit');
            expect(buttons[0].id).toEqual('button-12345-0');
            
        });
        
        it("should put Edit {Name} on the edit buttons when no 'Name' field supplied", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'}
                ],
                editFieldName: 'Name'
            });
            var html_node = grid.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(2);
            expect(buttons[0].innerHTML).toEqual('Edit <span style="position: absolute !important;left: -10000px;overflow: hidden;">first</span>');
            expect(buttons[0].id).toEqual('button-12345-0');
        });
        
        it("should provide hidden name even when it is very long", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: ugly_store,
                columns: [
                    {text:'Ref', dataIndex:'_ref'},
                    {text:'Name',dataIndex:'Name'}
                ],
                editFieldName: 'Name'
            });
            var html_node = grid.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(1);
            expect(buttons[0].innerHTML).toEqual('Edit <span style="position: absolute !important;left: -10000px;overflow: hidden;">1234 1234 1234 1234 1234 1234 1234 1234 1234 1234 </span>');
            expect(buttons[0].id).toEqual('button-137-0');
        });
        
        it("should put id on button even if no ObjectID is supplied", function(){
            grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store_without_objectID,
                columns: [
                    {text:'Ref', dataIndex:'_ref'},
                    {text:'Name',dataIndex:'Name'}
                ],
                editFieldName: 'Name'
            });
            var html_node = grid.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(2);
            expect(buttons[0].id).toEqual('button--0');
        });
        
        
        it("should not supply buttons when showEdit = false", function(){
                        grid = Ext.create('Rally.technicalservices.accessible.grid', {
                renderTo: "componentTestArea",
                store: simple_store,
                showEdit: false,
                columns: [
                    {text:'Ref', dataIndex:'_ref'}
                ]
            });
            var html_node = grid.getEl().dom;
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(0);
            
        });        
    });
});