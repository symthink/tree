import { Component, h, Prop } from '@stencil/core';
import { CitationStyleLang } from '../../core/symthink.class';

@Component({
  tag: 'd2-sources-list',
  styleUrl: 'd2-sources-list.scss',
  shadow: true,
})
export class D2SourcesList {
  @Prop() sourceList: { id: string; index: number; src: CitationStyleLang }[] = [];
  @Prop() canEdit: boolean = false;
  
  render() {
    return [
      !this.canEdit && <div class="sources-border">
        <div>§</div>
      </div>,
      <ion-list>
        {this.sourceList?.map((md, ix) => (
          <d2-src-metadata
            data={md.src}
            stid={md.id}
            listNo={ix + 1}
            index={md.index}
            canEdit={this.canEdit}
          ></d2-src-metadata>
        ))}
      </ion-list>
    ];
  }
} 