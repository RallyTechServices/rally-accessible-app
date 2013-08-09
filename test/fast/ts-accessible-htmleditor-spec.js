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
    
    describe("When inserting into page",function(){
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (editor) { editor.destroy(); }
        });
        
        it("should have label 'for' the iframe ID and allow role setting",function(){
            editor = Ext.create('Rally.technicalservices.accessible.htmleditor',{
                value: '&nbsp;Fred&nbsp;was here',
                iframeAttrTpl: 'role="aria-textbox" aria-multiline="true"',
                renderTo: 'componentTestArea'
            });
            var div_dom = editor.getEl().dom;
            var labels = Ext.dom.Query.select('label',div_dom);
            var iframes = Ext.dom.Query.select('iframe',div_dom);
            expect(labels.length).toEqual(1);
            expect(iframes.length).toEqual(1);
            
            expect(labels[0].getAttribute('for')).toEqual(iframes[0].id);
            expect(iframes[0].getAttribute('role')).toEqual('aria-textbox');
            expect(iframes[0].getAttribute('aria-multiline')).toEqual('true');
        });
    });
});