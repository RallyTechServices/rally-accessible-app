describe("Accessible Editor",function(){
    var editor;
    describe("When testing simple configuration", function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (editor) { editor.destroy(); }
        });
        
        it("is happy with defaults", function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{});
            expect(editor).not.toBe(null);
            expect(editor.record).toBe(null);
            expect(editor.fields).toEqual([]);
        });
        
        it("reports no fields when no fields supplied", function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                record: simple_store.getRecords()[0]
            });
            var html_node = editor.getEl().dom;
            expect(html_node.innerHTML).toEqual('No fields supplied');
        });
        
        it("reports no record when no record supplied", function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                fields: [
                    {text:'The Ref', dataIndex:'_ref'},
                    {text:'The Name', dataIndex:'Name'}
                ]
            });
            var html_node = editor.getEl().dom;
            expect(html_node.innerHTML).toEqual('No record supplied');
        });
    });
    
    describe("When given a store",function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (editor) { editor.destroy(); }
        });
        
        it("should create a form with fields as defined by 'fields'",function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                fields: [
                    {text:'The Ref', dataIndex:'_ref'},
                    {text:'The Name', dataIndex:'Name'}
                ],
                record: simple_store.getRecords()[0]
            });
            var html_node = editor.getEl().dom;
            var labels = Ext.dom.Query.select('label',html_node);
            expect(labels.length).toEqual(2);
            expect(labels[0].innerHTML).toEqual('The Ref:');
            expect(labels[1].innerHTML).toEqual('The Name:');
            //console.log(Ext.dom.Query.select('input',html_node));
            var inputs = Ext.dom.Query.select('input',html_node);
            expect(inputs[0].value).toEqual('/mock/12345');
            expect(inputs[1].value).toEqual('first');
            
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(0);
        });
        
        it("should add buttons to a form when given button names", function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                fields: [
                    {text:'The Name', dataIndex:'Name'}
                ],
                record: simple_store.getRecords()[0],
                buttons: [
                    { text: 'Save' },
                    { text: 'Cancel' }
                ]
            });
            var html_node = editor.getEl().dom;
            var labels = Ext.dom.Query.select('label',html_node);
            expect(labels.length).toEqual(1);
            expect(labels[0].innerHTML).toEqual('The Name:');
            var inputs = Ext.dom.Query.select('input',html_node);
            expect(inputs[0].value).toEqual('first');
            
            var buttons = Ext.dom.Query.select('button',html_node);
            expect(buttons.length).toEqual(2);
            expect(buttons[0].childNodes[0].innerHTML).toEqual('Save');
        });
        
        it("should create a form with field types supplied by editor in fields",function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                fields: [
                    {text:'The Ref', dataIndex:'_ref'},
                    {text:'The Name', dataIndex:'Name', editor: 'rallytextfield'},
                    {text:'Iteration',dataIndex:'Iteration',editor:'tsaccessiblecombobox'}
                ],
                record: simple_store.getRecords()[0]
            });
            var html_node = editor.getEl().dom;
            var labels = Ext.dom.Query.select('label',html_node);
            expect(labels.length).toEqual(3);
            expect(labels[0].innerHTML).toEqual('The Ref:');
            expect(labels[1].innerHTML).toEqual('The Name:');
            //console.log(Ext.dom.Query.select('input',html_node));
            var text_fields = editor.query('rallytextfield');
            expect(text_fields.length).toEqual(2);
            expect(text_fields[0].getValue()).toEqual('/mock/12345');
            expect(text_fields[1].getValue()).toEqual('first');
            
            var combobox_fields = editor.query('tsaccessiblecombobox');
            expect(combobox_fields.length).toEqual(1);

        });
        
        it("should get a field by field name",function(){
            editor = Ext.create('Rally.technicalservices.accessible.editarea',{
                renderTo: "componentTestArea",
                fields: [
                    {text:'The Ref', dataIndex:'_ref'},
                    {text:'The Name', dataIndex:'Name', editor: 'rallytextfield'},
                    {text:'Iteration',dataIndex:'Iteration',editor:'tsaccessiblecombobox'}
                ],
                record: simple_store.getRecords()[0]
            });
                        
            var text_fields = editor.query('rallytextfield');
            expect(editor.getFieldIdByName("Name")).toEqual(text_fields[1].id);
            
            var combobox_fields = editor.query('tsaccessiblecombobox');
            expect(editor.getFieldIdByName("Iteration")).toEqual(combobox_fields[0].id);
        });
    });
    
});