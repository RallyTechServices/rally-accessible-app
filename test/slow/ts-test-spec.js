//describe("a test", function(){
//    it("an asynchronous connected to Rally test",function(){
//        var store_loaded = false;
//        
//        var store = Ext.create('Rally.data.WsapiDataStore',{
//            model: 'Project',
//            autoLoad: true,
//            listeners: {
//                load: function(store,data,success) {
//                    console.log(data);
//                    store_loaded = true;
//                },
//                scope: this
//            }
//        });
//        // Format for asynchronous tests. Wait for the load to happen, then 
//        // explicitly run tests
//        waitsFor(function() { return store_loaded }, "Store never loaded");
//        runs( function() {
//            expect( store.getRecords().length ).not.toBe(0);
//            expect( store.getRecords().length ).not.toBe(0);
//        });
//    });
//});