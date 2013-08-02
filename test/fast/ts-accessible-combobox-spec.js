describe( "Accessible Combobox", function(){
    describe("When testing simple configurations", function(){
        it("is happy with defaults",function(){
            var cb = Ext.create('Rally.technicalservices.accessible.Combobox',{});
            expect(cb).not.toBe(null);
            expect(cb.store).toBe(null);
            expect(cb.componentId).toEqual('comboBox-_ref');
            expect(cb.fieldLabel).toEqual(null);
        });
        
        it("accepts simple config options", function() {
            var cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                componentId: "RallyTest",
                fieldLabel: 'Label'
            });
            expect(cb.componentId).toEqual('RallyTest');
            expect(cb.fieldLabel).toEqual('Label');
        });
    });
    
    describe("When given a store", function() {
        var cb;
        
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
            expect(selector.id).toEqual('comboBox-_ref');
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
        
        it("should generate the drop-down html when using a different value than '_ref'", function(){
            cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                store: alternate_name_store,
                renderTo: "componentTestArea",
                valueField: 'DisplayName',
                displayField: '_ref'
            });
            var div_dom = cb.getEl().dom;
            var options = div_dom.childNodes[0].childNodes;
            expect(options.length).toEqual(2);
            expect(options[0].text).toEqual("/mock/12345");
            expect(options[0].value).toEqual('first');
            expect(options[1].text).toEqual("/mock/12346");
            expect(options[1].value).toEqual('second');
            
            var selector = div_dom.childNodes[0];
            expect(selector.id).toEqual('comboBox-DisplayName');

        });
        it("should generate a label and properly associate it with the combobox", function(){
            cb = Ext.create('Rally.technicalservices.accessible.Combobox',{
                store: simple_store,
                fieldLabel: 'My Label',
                componentId: 'myselector',
                renderTo: "componentTestArea"
            });
            expect(cb.store).toBe(simple_store);
            var div_dom = cb.getEl().dom;
            var label = div_dom.childNodes[0];
            expect(label.innerHTML).toEqual('My Label:');
            expect(label.getAttribute('for')).toEqual('myselector');
            
            var selector = div_dom.childNodes[1];
            expect(selector.id).toEqual('myselector');
            var options = selector.childNodes;
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual("/mock/12345");
            expect(options[0].text).toEqual('first');
            expect(options[1].value).toEqual("/mock/12346");
            expect(options[1].text).toEqual('second');
        });
       
    });
});