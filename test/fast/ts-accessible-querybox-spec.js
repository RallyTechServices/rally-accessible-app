describe( 'Accessible Query Definer',function(){
    describe('Configurations and Settings',function(){
        var qb;
        
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (qb) { qb.destroy(); }
        });
        
        it("should recognize initial human text",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: 'DE77'
            });
            expect(qb.queryTextField.getValue()).toEqual('DE77');
            
        });
        it("should set human text when setValue called",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea'
            });
            qb.setValue("DE88");
            expect(qb.queryTextField.getValue()).toEqual('DE88');
        });
        it("should set human text when setHumanValue called",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea'
            });
            qb.setHumanTextValue("DE99");
            expect(qb.queryTextField.getValue()).toEqual('DE99');
        });
        
    });
    
    describe('When given formatted IDs',function(){
        var qb;
        
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        });
        
        afterEach(function(){
            if (qb) { qb.destroy(); }
        });
        
        it("should recognize DE for defect",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: 'DE77'
            });
            expect(qb.getHumanTextValue()).toEqual('DE77');
            expect(qb.getValue().toString()).toEqual('(FormattedID = "DE77")');
        });
        
        it("should recognize D for defect",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: 'D78'
            });
            expect(qb.getHumanTextValue()).toEqual('D78');
            expect(qb.getValue().toString()).toEqual('(FormattedID = "D78")');
        });
        
        it("should recognize US for story",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: 'US10'
            });
            expect(qb.getHumanTextValue()).toEqual('US10');
            expect(qb.getValue().toString()).toEqual('(FormattedID = "US10")');
        });
        
        it("should recognize S for story",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: 'S10'
            });
            expect(qb.getHumanTextValue()).toEqual('S10');
            expect(qb.getValue().toString()).toEqual('(FormattedID = "S10")');
        });
        
        it("should be ok with added spaces",function() {
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: ' S10 '
            });
            expect(qb.getHumanTextValue()).toEqual(' S10 ');
            expect(qb.getValue().toString()).toEqual('(FormattedID = "S10")');
        });
    });

    describe('ObjectIDs and URLs',function(){
        var qb;
        
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );
        
            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: ' S10 '
            });
        });
        
        afterEach(function(){
            if (qb) { qb.destroy(); }
        });
        
        it('should recognize a straight objectID',function(){
            
            console.log('qb',qb);
            qb.setHumanTextValue('012345');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "012345")');
        });

        it('should recognize a straight objectID with spaces',function(){
            qb.setHumanTextValue(' 012345 ');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "012345")');
        });
        
        it('should recognize short reference for a story',function(){
            qb.setHumanTextValue('/hierarchicalrequirement/012345 ');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "012345")');
        });
        
        it('should recognize short reference for a defect',function(){
            qb.setHumanTextValue('/defect/012345 ');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "012345")');
        });
        
        it('should recognize long detail URL',function(){
            qb.setHumanTextValue('https://rally1.rallydev.com/#/11508073080/detail/userstory/13522134073 ');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "13522134073")');
        });
        
        it('should recognize reference long URL',function(){
            qb.setHumanTextValue('https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement/9818471804 ');
            expect(qb.getValue().toString()).toEqual('(ObjectID = "9818471804")');
        });
});

    describe('Straight Strings',function(){
        var qb;
        
        beforeEach( function() {
            if ( Ext.get("componentTestArea") ) { 
                Ext.removeNode(Ext.get("componentTestArea").dom);
            }
            Ext.DomHelper.append( Ext.getBody(), "<div id='componentTestArea' style='visibility: hidden'></div>" );

            qb = Ext.create('Rally.technicalservices.accessible.queryBox',{
                renderTo:'componentTestArea',
                humanText: ' S10 '
            });
        });
        
        afterEach(function(){
            if (qb) { qb.destroy(); }
        });
        
        it('should provide a contains search for regular text',function(){
            qb.setHumanTextValue('hi, mom!');
            expect(qb.getValue().toString()).toEqual('((Name contains "hi, mom!") OR (Description contains "hi, mom!"))');
        });
        
        it('should provide a contains search for text that has some numbers',function(){
            qb.setHumanTextValue('my #1 mom is 20 kinds of awesome');
            expect(qb.getValue().toString()).toEqual('((Name contains "my #1 mom is 20 kinds of awesome") OR (Description contains "my #1 mom is 20 kinds of awesome"))');
        });
        
        it('should provide a contains search for text almost looks like a FormattedID',function(){
            qb.setHumanTextValue(' He3 is heavy helium');
            expect(qb.getValue().toString()).toEqual('((Name contains "He3 is heavy helium") OR (Description contains "He3 is heavy helium"))');
        });
        
        it('should provide null query if nothing provided',function(){
            qb.setHumanTextValue('    ');
            expect(qb.getValue()).toEqual(null);
        });
    });
});