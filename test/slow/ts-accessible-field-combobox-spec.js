describe("Field Combobox",function(){
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
        
    it("should show default ScheduleState choices for combobox", function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            expect(cb.displayField).toEqual('StringValue');
            var html_node = cb.getEl().dom;
            var options = Ext.dom.Query.select('option',html_node);
            expect(options.length > 3);
           
        });
    });
    
    it("should set and retrieve ScheduleState choices for combobox", function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            
            cb.setValue("Completed");
            expect(cb.getValue()).toEqual("Completed");
        });
    });
    
    it("should set initial value when passed", function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea",
            value: 'Accepted'
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            expect(cb.getValue()).toEqual("Accepted");
        });
    });
});