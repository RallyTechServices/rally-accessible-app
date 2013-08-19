describe("Field Collection Summary",function(){
    var cb;
    
        beforeEach( function() {
        iterations = [];
        
        if ( Ext.get("componentTestArea-collections") ) { 
            Ext.removeNode(Ext.get("componentTestArea-collections").dom);
        }
        Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea-collections' style='visibility: hidden'></div>" );
    });
    
    afterEach(function(){
        if (cb) { cb.destroy(); }
    });
    
    it("should show zero if not given a value",function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.FieldValueCollection',{
            renderTo:"componentTestArea-collections"
        });
        expect(cb.getValue()).toEqual('0');
        expect(cb.fieldLabel).toEqual('Count of ');
        
    });
    
});