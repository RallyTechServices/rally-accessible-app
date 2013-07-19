Ext.define('mockWsapiDataStore',{
    extend: 'Rally.data.custom.Store',
    alias: 'widget.mockwsapidatastore',
    getRecords: function() {
        return this.getData();
    }
});