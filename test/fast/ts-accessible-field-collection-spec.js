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
    
    it("should have all the pieces",function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.FieldValueCollection',{
            renderTo:"componentTestArea-collections"
        });
        expect(cb.getValue()).toEqual('0');
        expect(cb.fieldLabel).toEqual('Count of ');
        
        var html_node = cb.getEl().dom;
        var labels = Ext.dom.Query.select('label',html_node);
        var inputs = Ext.dom.Query.select('input',html_node);
        var buttons = Ext.dom.Query.select('button',html_node);
        
        expect(labels.length).toEqual(1);
        expect(inputs.length).toEqual(1);
        expect(labels[0].getAttribute("for")).toEqual(inputs[0].id);
        expect(buttons.length).toEqual(2);
        var view_button_text = Ext.dom.Query.select('span',buttons[0]);
        expect(view_button_text[0].innerHTML).toEqual("View Tasks");
        var add_button_text = Ext.dom.Query.select('span',buttons[1]);
        expect(add_button_text[0].innerHTML).toEqual("Add Tasks");
        
    });
    
    it("should show zero if not given a value",function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.FieldValueCollection',{
            renderTo:"componentTestArea-collections"
        });
        expect(cb.getValue()).toEqual('0');
        expect(cb.fieldLabel).toEqual('Count of ');
        
    });
    
    it("should show zero if given a blank value",function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.FieldValueCollection',{
            renderTo:"componentTestArea-collections",
            value: ''
        });
        expect(cb.getValue()).toEqual('0');
        expect(cb.fieldLabel).toEqual('Count of ');
        
    });
    
    it("should show zero if given a collections value",function(){
        var component_loaded = false;
        cb = Ext.create('Rally.technicalservices.accessible.FieldValueCollection',{
            renderTo:"componentTestArea-collections",
            fieldLabel: 'Tasks',
            value: {
                Count: 125,
                _rallyAPIMajor: "2",
                _rallyAPIMinor: "0",
                _ref: "https://rally1.rallydev.com/slm/webservice/v2.0/HierarchicalRequirement/13292923450/Tasks",
                _type: "Task"
            }
        });
        expect(cb.getValue()).toEqual('125');
        expect(cb.fieldLabel).toEqual('Count of Tasks');
        
    });
    
    
});