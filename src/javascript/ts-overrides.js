/*
 * Straight override of parts of Ext components so we don't have to subclass them
 */

 // Change the template of the standard grid
 Ext.override(Ext.view.TableChunker,{
    metaTableTpl: [
        '{%if (this.openTableWrap)out.push(this.openTableWrap())%}',
        '<table role="grid" class="' + Ext.baseCSSPrefix + 'grid-table ' + Ext.baseCSSPrefix + 'grid-table-resizer" border="0" cellspacing="0" cellpadding="0" {[this.embedFullWidth(values)]}>',
            '<tbody>',
            '<tr class="' + Ext.baseCSSPrefix + 'grid-header-row">',
            '<tpl for="columns">',
                '<th class="' + Ext.baseCSSPrefix + 'grid-col-resizer-{id}" style="width: {width}px; height: 0px;"></th>',
            '</tpl>',
            '</tr>',
            '{[this.openRows()]}',
                '{row}',
                '<tpl for="features">',
                    '{[this.embedFeature(values, parent, xindex, xcount)]}',
                '</tpl>',
            '{[this.closeRows()]}',
            '</tbody>',
        '</table>',
        '{%if (this.closeTableWrap)out.push(this.closeTableWrap())%}'
    ]
 });