describe("a test", function(){
    it("test",function(){
        var store = Ext.create('Rally.data.WsapiDataStore',{
            model: 'User Story',
            autoLoad: true,
            context: {
                project:'/project/3181911883',
                workspace:'/workspace/41529001'
            },
            listeners: {
                load: function(store,data,success) {
                    console.log(data);
                },
                scope: this
            }
        });
    });
});