describe("Field Helper", function(){
    var fh;
    
    beforeEach(function(){
        if ( Ext.get("componentTestArea") ) { 
            Ext.removeNode(Ext.get("componentTestArea").dom);
        }
        Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
    });
    
    afterEach(function(){
        if(fh){fh.destroy();}
    });
    
    it("should return empty array for unknown model type",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'NotReallyAType',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldsAsColumns().length).toEqual(0);
        });
    });
    
    it("should return all the fields for a story",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldsAsColumns().length).toBeGreaterThan(37); // 37 is the number of non-collection, non-custom fields for stories in 1.43, I think
            expect(fh.getFieldAsColumn("ScheduleState").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("ScheduleState").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Parent").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Parent").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Description").editor.xtype).toEqual('tsaccessiblehtmleditor');
            expect(fh.getFieldAsColumn("Description").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Name").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("Name").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("CreationDate").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("CreationDate").editor.readOnly).toEqual(true);
            expect(fh.getFieldAsColumn("State")).toEqual(null);
        });
    });
    it("should return all the fields for a defect",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'Defect',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldsAsColumns().length).toBeGreaterThan(37); // 37 is the number of non-collection, non-custom fields for stories in 1.43, I think
            expect(fh.getFieldAsColumn("ScheduleState").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("ScheduleState").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Requirement").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Requirement").editor.readOnly).toEqual(false);   
            expect(fh.getFieldAsColumn("Name").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("Name").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Description").editor.xtype).toEqual('tsaccessiblehtmleditor');
            expect(fh.getFieldAsColumn("Description").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("CreationDate").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("CreationDate").editor.readOnly).toEqual(true);
            expect(fh.getFieldAsColumn("State").editor.xtype).toEqual('tsaccessiblefieldcombobox');
        });
    });
});