describe("Field Combobox",function(){
    var cb;
    var iterations;
    
    beforeEach( function() {
        iterations = [];
        
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
    
    it("should set and retrieve defect State choices combobox", function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
            listeners: { load: function() { component_loaded = true; } },
            field: 'State',
            model: 'Defect',
            value: 'Closed',
            renderTo: "componentTestArea"
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            expect(cb.getValue()).toEqual("Closed");
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
    
    it("should display available iterations", function(){
        var component_loaded = false;
        Ext.create('Rally.data.WsapiDataStore',{
            model: 'Iteration',
            autoLoad: true,
            listeners: {
                load: function(store,data,success){
                    iterations = data;
                    cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
                        listeners: { load: function() { component_loaded = true; } },
                        renderTo: "componentTestArea",
                        field: 'Iteration'
                    });
                }
            }
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            expect(iterations.length).toBeGreaterThan(0); // should set up for the test
            expect(cb.getValue()).toEqual('');
            var html_node = cb.getEl().dom;
            var options = Ext.dom.Query.select('option',html_node);
            expect(options.length).toEqual(iterations.length + 1);
            expect(options[1].innerHTML).toEqual(iterations[0].get('Name'));
            expect(options[1].getAttribute('value')).toEqual(iterations[0].get('_ref'));
        });
    });
    
    it("should set iteration on load if value provided", function(){
        var component_loaded = false;
        Ext.create('Rally.data.WsapiDataStore',{
            model: 'Iteration',
            autoLoad: true,
            listeners: {
                load: function(store,data,success){
                    iterations = data;
                    cb = Ext.create('Rally.technicalservices.accessible.combobox.FieldValueCombobox',{
                        listeners: { load: function() { component_loaded = true; } },
                        renderTo: "componentTestArea",
                        field: 'Iteration',
                        value: iterations[0].getData()
                    });
                }
            }
        });
        
        waitsFor(function(){ return component_loaded }, "Combobox never loaded");
        runs(function() {
            expect(iterations.length).toBeGreaterThan(0); // should set up for the test
            var html_node = cb.getEl().dom;
            var options = Ext.dom.Query.select('option',html_node);
            expect(options.length).toEqual(iterations.length + 1);
            expect(options[1].innerHTML).toEqual(iterations[0].get('Name'));
            expect(options[1].getAttribute('value')).toEqual(iterations[0].get('_ref'));
            expect(cb.getValue()).toEqual(iterations[0].get('_ref'));
        });
    });
});