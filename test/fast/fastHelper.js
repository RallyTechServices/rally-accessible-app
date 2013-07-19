//
Ext.define('mockWsapiDataStore',{
    extend: 'Rally.data.custom.Store',
    alias: 'widget.mockwsapidatastore',
    getRecords: function() {
        var records = [];
        var data = this.getData();
        data.each(function(record){
            records.push(record);
        });
        return records;
    }
});