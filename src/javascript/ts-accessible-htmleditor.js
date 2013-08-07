/*
 * accessible html editor, extended to capture tab key and pass focus, and also
 * to clean some of the text that won't save
 */
Ext.define('Rally.technicalservices.accessible.htmleditor',{
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.tsaccessiblehtmleditor',
    initComponent: function() {
        this.callParent();
        this.addEvents(
        /**
             * @event tab
             * Fires when one of tab is pushed inside the box (want to be able to pass
             * focus or do something else if tab is pushed instead of inserting \t)
             * @param {Rally.technicalservices.accessible.htmleditor} this
             * @param {Boolean} shift key also pressed
             */
            'tab'
        );
    },
    getInputId: function() {
        
        return this.id + "-iframeEl";
    },
    // get tabs out of the html editor
    fixKeys: (function() { // load time branching for fastest keydown performance
        if (Ext.isIE) {
            return function(e){
                var me = this,
                    k = e.getKey(),
                    doc = me.getDoc(),
                    readOnly = me.readOnly,
                    range, target;

                if (k === e.TAB) {
                    e.stopEvent();
//                    if (!readOnly) {
//                        range = doc.selection.createRange();
//                        if(range){
//                            range.collapse(true);
//                            range.pasteHTML('&#160;&#160;&#160;&#160;');
//                            me.deferFocus();
//                        }
//                    }
                }
                else if (k === e.ENTER) {
                    if (!readOnly) {
                        range = doc.selection.createRange();
                        if (range) {
                            target = range.parentElement();
                            if(!target || target.tagName.toLowerCase() !== 'li'){
                                e.stopEvent();
                                range.pasteHTML('<br />');
                                range.collapse(false);
                                range.select();
                            }
                        }
                    }
                }
            };
        }

        if (Ext.isOpera) {
            return function(e){
                var me = this;
                if (e.getKey() === e.TAB) {
                    e.stopEvent();
//                    if (!me.readOnly) {
//                        me.win.focus();
//                        me.execCmd('InsertHTML','&#160;&#160;&#160;&#160;');
//                        me.deferFocus();
//                    }
                }
            };
        }

        if (Ext.isWebKit) {
            return function(e){
                var me = this,
                    k = e.getKey(),
                    readOnly = me.readOnly;

                if (k === e.TAB) {
                    
                    e.stopEvent();
                    // the tab event return this editor and shift_key_pressed
                    me.fireEvent('tab',me,e.shiftKey);
//                    if (!readOnly) {
//                        me.execCmd('InsertText','\t');
//                        me.deferFocus();
//                    }
                }
                else if (k === e.ENTER) {
                    e.stopEvent();
                    if (!readOnly) {
                        me.execCmd('InsertHtml','<br /><br />');
                        me.deferFocus();
                    }
                }
            };
        }

        return null; // not needed, so null
    }()),
    //docs inherit from Field
    // add clearing bad characters
    getValue : function() {
        var me = this,
            value;
        if (!me.sourceEditMode) {
            me.syncValue();
        }
        value = me.rendered ? me.textareaEl.dom.value : me.value;
        value = me.cleanValue(value);
        me.value = value;
        return value;
    },
    cleanValue: function(value) {
        var clean_value = value.replace(/\&nbsp;/g," ");
        
        return clean_value;
    }
});
