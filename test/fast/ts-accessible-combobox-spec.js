describe( "Accessible Combobox", function(){
    describe("When testing simple configurations", function(){
        console.log('here');
        it("is happy with defaults",function(){
            var cb = Ext.create('Rally.technicalservices.accessible.Combobox',{});
            expect(cb).not.toBe(null);
            expect(cb.store).toBe(null);
            expect(cb.componentId).toEqual('comboBox');
        });
        
        it("accepts simple config options", function() {
            var cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                componentId: "RallyTest",
                itemId: 'Item Test Id'
            });
            expect(cb.componentId).toEqual('RallyTest');
            expect(cb.itemId).toEqual('Item Test Id');
        });
    });
    
    describe("When given a store", function() {
        var cb;
        var simple_store = Ext.create('mockWsapiDataStore',{
            data: [
                { Name: 'first',  _ref: '/mock/12345' },
                { Name: 'second', _ref: '/mock/12346' }
            ]
        });
        
        var alternate_name_store = Ext.create('mockWsapiDataStore',{
            data: [
                { DisplayName: 'first',  _ref: '/mock/12345' },
                { DisplayName: 'second', _ref: '/mock/12346' }
            ]
        });
        
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (cb) { cb.destroy(); }
        });
        
        it("should generate the drop-down html with '_ref' as the value and display the 'Name'", function(){
            cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                store: simple_store,
                renderTo: "componentTestArea"
            });
            expect(cb.store).toBe(simple_store);
            var div_dom = cb.getEl().dom;
            var selector = div_dom.childNodes[0];
            expect(selector.id).toEqual('comboBox');
            var options = selector.childNodes;
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual("/mock/12345");
            expect(options[0].text).toEqual('first');
            expect(options[1].value).toEqual("/mock/12346");
            expect(options[1].text).toEqual('second');
        });
        
        it("should generate the drop-down html when display is a different field than 'Name'", function(){
            cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                store: alternate_name_store,
                renderTo: "componentTestArea",
                displayField: 'DisplayName'
            });
            var div_dom = cb.getEl().dom;
            var options = div_dom.childNodes[0].childNodes;
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual("/mock/12345");
            expect(options[0].text).toEqual('first');
            expect(options[1].value).toEqual("/mock/12346");
            expect(options[1].text).toEqual('second');
        });
       
    });
});