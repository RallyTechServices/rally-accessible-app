/*
 * Straight override of parts of Ext components so we don't have to subclass them
 */

// get tabs out of the html editor
Ext.override(Ext.form.field.HtmlEditor,{
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
    }())
 });