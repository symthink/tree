import { Component, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { SymThink, SymThinkDocument, StateEnum, CardRules } from '../../core/symthink.class';

@Component({
  tag: 'd2-card-item',
  styleUrl: 'd2-card-item.scss',
  shadow: true,
})
export class D2CardItem {
  @Prop() item: SymThink;
  @Prop() canEdit: boolean = false;
  @Prop() parentDoc: SymThinkDocument;
  @Prop() sourceNumbers: number[] = [];
  @State() change: boolean = false;

  @Event() itemClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;
  @Event() optionsClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;
  @Event() expandClick: EventEmitter<{ item: SymThink }>;
  @Event() textChange: EventEmitter<{ item: SymThink, isModified: boolean }>;
  @Event() keyAction: EventEmitter<{ key: string, type?: string }>;

  get voting(): boolean {
    return this.parentDoc?.state$.getValue() === StateEnum.Voting;
  }

  get isEditable(): boolean {
    return !!(this.item.selected && this.canEdit);
  }

  renderLabel(txt?: string) {
    if (!txt) return null;
    let label;
    if (/^[^:]+:/.test(txt)) {
      let parts = txt.split(':');
      label = parts.shift();
      txt = parts.join(':').trim();
    }
    return [
      !!label && <b style={{ 'font-weight': 'bold' }}>{label}:</b>,
      ' ' + txt,
    ];
  }

  textPlaceholder() {
    return this.item?.type ? 
      CardRules.find(itm => itm.type === this.item.type)?.placeholder || '' : 
      '';
  }

  handleItemClick(e: MouseEvent | PointerEvent) {
    e.stopPropagation();
    if (this.parentDoc.state$.getValue() !== StateEnum.Viewing) {
      return;
    }

    const el = e.target as HTMLElement;
    const ionItem = el.closest('ion-item');
    if (ionItem) {
      ionItem.classList.remove('item-over');
    }
    
    this.item.select$.next(true);
    this.itemClick.emit({ item: this.item, event: e });
  }

  handleTextChange(event: CustomEvent<{ item: SymThink, isModified: boolean }>) {
    this.textChange.emit(event.detail);
    this.change = !this.change;
  }

  handleKeyAction(event: CustomEvent<{ key: string, type?: string }>) {
    this.keyAction.emit(event.detail);
  }

  handleOptionsClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    this.optionsClick.emit(event.detail);
  }

  handleExpandClick() {
    this.expandClick.emit({ item: this.item });
  }

  render() {
    return (
      <ion-item
        id={this.item.id}
        lines="none"
        class={{
          shared: true,
          selected: this.item.selected && this.canEdit,
          'can-edit': this.canEdit,
          'top-item': true,
          'vote-break': this.voting && this.parentDoc?.voteForTop === 0
        }}
        onClick={(e) => this.handleItemClick(e)}
        onMouseEnter={(evt: MouseEvent) => {
          const e = evt.target as HTMLElement;
          if (this.canEdit && !this.item.selected) {
            e.classList.add('item-over');
          }
        }}
        onMouseLeave={(evt: MouseEvent) => {
          const e = evt.target as HTMLElement;
          e.classList.remove('item-over');
        }}
      >
        {this.isEditable && [
          <d2-text-editor 
            item={this.item}
            height={50}
            isTopItem={true}
            placeholder={this.textPlaceholder()}
            onTextChange={(e) => this.handleTextChange(e)}
            onKeyAction={(e) => this.handleKeyAction(e)}
          ></d2-text-editor>,
          <d2-expand-button 
            onExpandClick={() => this.handleExpandClick()}
          ></d2-expand-button>
        ]}
        {!this.isEditable && [
          <ion-label
            style={{ 'flex': 1, 'max-width': 'none' }}
            class={{
              'ion-text-wrap': true,
              placeholder: !this.item.hasItemText(),
            }}
          >
            {this.item.label && <h2 class="titleCase">{this.item.label}</h2>}
            {this.item.getCurrentItemText() || this.textPlaceholder()}
            {this.item.isEvent && (
              <p>
                <b>Date:</b> {this.item.eventDate?.toLocaleString()}
              </p>
            )}
            {!!this.sourceNumbers.length && (
              <p class="item-subscript">
                <ion-icon name="bookmark" size="small"></ion-icon>&nbsp;{this.sourceNumbers.join(',')}
              </p>
            )}
          </ion-label>,
          this.canEdit && <d2-item-options 
            item={this.item}
            onOptionsClick={(e) => this.handleOptionsClick(e)}
          ></d2-item-options>
        ]}
      </ion-item>
    );
  }
} 