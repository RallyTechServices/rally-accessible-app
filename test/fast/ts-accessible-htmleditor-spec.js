describe("Accessible HTML Editor",function(){
    var editor;
    describe("When getting value to save",function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (editor) { editor.destroy(); }
        });
        
        it("should replace leading '&nbsp;' because it won't send properly",function(){
            editor = Ext.create('Rally.technicalservices.accessible.htmleditor',{
                value: '&nbsp;Fred was here'
            });
            expect(editor.getValue()).toEqual(' Fred was here');
        });
        it("should replace '&nbsp;'",function(){
            editor = Ext.create('Rally.technicalservices.accessible.htmleditor',{
                value: '&nbsp;Fred&nbsp;was here'
            });
            expect(editor.getValue()).toEqual(' Fred was here');
        });
    });
});