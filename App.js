Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //Write app code here
        this.add({ 
            xtype:'button', 
            renderTpl: ['<button id="MyButton">Hi</button>'],
            listeners: {
                click: function() {
                    alert('hi');
                }
            }
        });
            
        this.add({ 
            xtype:'button', 
            renderTpl: ['<button id="MyButton">Again</button>'],
            listeners: {
                click: function() {
                    alert('again');
                }
            }
        });
    }
});
