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
            expect(fh.getFieldsAsColumns().length).toBeGreaterThan(20); // 37 is the number of non-collection, non-custom fields for stories in 1.43, I think
            expect(fh.getFieldAsColumn("ScheduleState").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("ScheduleState").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Description").editor.xtype).toEqual('tsaccessiblehtmleditor');
            expect(fh.getFieldAsColumn("Description").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Name").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("Name").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("CreationDate").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("CreationDate").editor.readOnly).toEqual(true);
            expect(fh.getFieldAsColumn("State")).toEqual(null);
            expect(fh.getFieldAsColumn("Blocked").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Tasks").editor.xtype).toEqual('tsaccessiblefieldcollectionbox');
        });
    });
    
    it("should add (required) to required fields for fields that are not read only",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldsAsColumns().length).toBeGreaterThan(20); // 37 is the number of non-collection, non-custom fields for stories in 1.43, I think
            expect(fh.getFieldAsColumn("ScheduleState").editor.fieldLabel).toEqual('Schedule State (required)');
            expect(fh.getFieldAsColumn("Name").editor.fieldLabel).toEqual('Name (required)');
            expect(fh.getFieldAsColumn("PlanEstimate").editor.fieldLabel).toEqual('Plan Estimate');
            expect(fh.getFieldAsColumn("Notes").editor.fieldLabel).toEqual('Notes rich text field');
            expect(fh.getFieldAsColumn("FormattedID").editor.fieldLabel).toEqual('Formatted ID');
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
            expect(fh.getFieldsAsColumns().length).toBeGreaterThan(20); // 37 is the number of non-collection, non-custom fields for stories in 1.43, I think
            expect(fh.getFieldAsColumn("ScheduleState").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("ScheduleState").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Name").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("Name").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("Description").editor.xtype).toEqual('tsaccessiblehtmleditor');
            expect(fh.getFieldAsColumn("Description").editor.readOnly).toEqual(false);
            expect(fh.getFieldAsColumn("CreationDate").editor.xtype).toEqual('rallytextfield');
            expect(fh.getFieldAsColumn("CreationDate").editor.readOnly).toEqual(true);
            expect(fh.getFieldAsColumn("State").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Package").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Package").editor.xtype).toEqual('tsaccessiblefieldcombobox');
            expect(fh.getFieldAsColumn("Package").editor.xtype).toEqual('tsaccessiblefieldcombobox');

        });
    });
    it("should return all the fields except unwanted fields for defect",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'Defect',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldAsColumn("ObjectID")).toEqual(null);
            expect(fh.getFieldAsColumn("DisplayColor")).toEqual(null);
            expect(fh.getFieldAsColumn("LatestDiscussionAgeInMinutes")).toEqual(null);
            expect(fh.getFieldAsColumn("DragAndDropRank")).toEqual(null);
            expect(fh.getFieldAsColumn("Recycled")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskActualTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskEstimateTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskRemainingTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskStatus")).toEqual(null);
            expect(fh.getFieldAsColumn("Subscription")).toEqual(null);
            expect(fh.getFieldAsColumn("Workspace")).toEqual(null);
            expect(fh.getFieldAsColumn("Project")).toEqual(null);
            expect(fh.getFieldAsColumn("RevisionHistory")).toEqual(null);
            expect(fh.getFieldAsColumn("Blocker")).toEqual(null);
            expect(fh.getFieldAsColumn("DirectChildrenCount")).toEqual(null);
        });
        
    });
    
    it("should return all the fields except unwanted fields for story",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            expect(fh.getFieldAsColumn("ObjectID")).toEqual(null);
            expect(fh.getFieldAsColumn("DisplayColor")).toEqual(null);
            expect(fh.getFieldAsColumn("LatestDiscussionAgeInMinutes")).toEqual(null);
            expect(fh.getFieldAsColumn("DragAndDropRank")).toEqual(null);
            expect(fh.getFieldAsColumn("Recycled")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskActualTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskEstimateTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskRemainingTotal")).toEqual(null);
            expect(fh.getFieldAsColumn("TaskStatus")).toEqual(null);
            expect(fh.getFieldAsColumn("Subscription")).toEqual(null);
            expect(fh.getFieldAsColumn("Workspace")).toEqual(null);
            expect(fh.getFieldAsColumn("Project")).toEqual(null);
            expect(fh.getFieldAsColumn("RevisionHistory")).toEqual(null);
            expect(fh.getFieldAsColumn("Blocker")).toEqual(null);
            expect(fh.getFieldAsColumn("DirectChildrenCount")).toEqual(null);
            expect(fh.getFieldAsColumn("Parent")).toEqual(null);
            expect(fh.getFieldAsColumn("PortfolioItem")).toEqual(null);
            expect(fh.getFieldAsColumn("Feature")).toEqual(null);
        });
    });
    
    it("should return all the fields for a story in order",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea"
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            var field_columns = fh.getFieldsAsColumns();
            expect(field_columns[0].dataIndex).toEqual('FormattedID');
            expect(field_columns[1].dataIndex).toEqual('Name');
        });
    });
    it("should return all the fields for a story in order when given a string",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea",
            field_order: 'ScheduleState'
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            var field_columns = fh.getFieldsAsColumns();
            expect(field_columns.length).toBeGreaterThan(10);
            expect(field_columns[0].dataIndex).toEqual('ScheduleState');
        });
    });
    it("should return all the fields for a story in order when given an array",function(){
        var component_loaded = false;
        fh = Ext.create('Rally.technicalservices.accessible.FieldHelper', {
            modelType: 'UserStory',
            listeners: { load: function() { component_loaded = true; } },
            renderTo: "componentTestArea",
            field_order: ['Name','ScheduleState']
        });
        waitsFor(function(){return component_loaded;}, "Field Helper never loaded");
        runs(function() {
            var field_columns = fh.getFieldsAsColumns();
            expect(field_columns.length).toBeGreaterThan(10);
            expect(field_columns[0].dataIndex).toEqual('Name');
            expect(field_columns[1].dataIndex).toEqual('ScheduleState');
        });
    });
});