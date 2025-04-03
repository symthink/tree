import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { CitationStyleLang, isCSL } from '../../core/symthink.class';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';

@Component({
  tag: 'd2-src-metadata',
  styleUrl: 'd2-src-metadata.scss',
  shadow: true,
})
export class D2SrcMetadata {
  @Prop() data: CitationStyleLang;
  @Prop() listNo: number;
  @Prop() stid: string;
  @Prop() index: number;
  @Prop() canEdit = false;

  @Event() itemAction: EventEmitter<{ action; value }>;

  private citation: string = '';

  componentWillLoad() {
    if (!isCSL(this.data)) {
      console.error('Invalid citation data:', this.data);
      return;
    }
    this.citation = Cite(this.data).format('bibliography', {
      format: 'html',
      template: 'apa',
      lang: 'en-US',
    });
  }

  onSourceClick() {
    if (this.data.URL) {
      window.open(this.data.URL, '_blank');
    }
  }

  onDeleteClick() {
    this.itemAction.emit({action: 'delete-source', value: {stid: this.stid, index: this.index}})
  }

  render() {
    if (this.canEdit) {
      return (
        <ion-item-sliding>
          <ion-item class="align-icon-start" onClick={() => this.onSourceClick()}>
            <div slot="start">{(this.listNo)}.</div>
            <ion-label class="ion-text-wrap" innerHTML={this.citation}></ion-label>
          </ion-item>
          <ion-item-options side="end" onIonSwipe={() => this.onDeleteClick()}>
            <ion-item-option color="danger" expandable onClick={() => this.onDeleteClick()}>
              <ion-icon
                size="large"
                name="trash-outline"
              ></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      );
    } else {
      return (
        <ion-item class="align-icon-start" detail detailIcon="open-outline" onClick={() => this.onSourceClick()}>
          <ion-label class="ion-text-wrap" innerHTML={this.citation}></ion-label>
        </ion-item>
      );
    }
  }
}
