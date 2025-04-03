import { Component, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { SymThink, CardRules, StateEnum } from '../../core/symthink.class';

@Component({
  tag: 'd2-support-item',
  styleUrl: 'd2-support-item.scss',
  shadow: true,
})
export class D2SupportItem {
  @Prop() item: SymThink;
  @Prop() canEdit: boolean = false;
  @Prop() itemNumber: number = 0;
  @Prop() isConclusion: boolean = false;
  @Prop() reOrderDisabled: boolean = true;
  @Prop() isVoting: boolean = false;
  @Prop() isVoteBreak: boolean = false;
  @Prop() sourceNumbers: number[] = [];
  @State() change: boolean = false;

  @Event() itemClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;
  @Event() optionsClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;
  @Event() extendClick: EventEmitter<{ item: SymThink }>;
  @Event() removeClick: EventEmitter<{ item: SymThink }>;
  @Event() expandClick: EventEmitter<{ item: SymThink }>;
  @Event() textChange: EventEmitter<{ item: SymThink, isModified: boolean }>;
  @Event() keyAction: EventEmitter<{ key: string, type?: string }>;

  get isEditable(): boolean {
    return !!(this.item.selected && this.canEdit && !this.item.isKidEnabled() && !this.item.url);
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

  renderSubscrLine(itm: SymThink) {
    let place = 'Municipality';
    let titleCase = (s: string) =>
      s.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    if (itm.url?.host === 'collection.fs') {
      try {
        const p = itm.url.pathname.split('/');
        p.pop();
        p.pop();
        const a = p.pop();
        const b = a.split('-').pop();
        const c = b.split('=');
        if (c.length === 2) {
          place = titleCase(c[0]) + ': ' + titleCase(c[1]);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return (
      <div>
        <ion-icon
          size="small"
          color="primary"
          name="notifications-outline"
        ></ion-icon>
        &nbsp;5 days left&nbsp;
        <ion-icon size="small" color="primary" name="earth-outline"></ion-icon>
        &nbsp;{place}
      </div>
    );
  }

  textPlaceholder(item: SymThink) {
    const info = CardRules.find((itm) => itm.type === item.type);
    if (info && item.selected) {
      return info.placeholder;
    }
    return '';
  }

  handleItemClick(evt: MouseEvent | PointerEvent) {
    evt.stopPropagation();
    if (this.item.url) {
      this.itemClick.emit({ item: this.item, event: evt });
    } else {
      if (this.item.isKidEnabled()) {
        const ionItem = evt
          .composedPath()
          .find(
            (e) => (e as HTMLElement).localName === 'ion-item'
          ) as HTMLElement;
        if (ionItem) {
          ionItem.classList.remove('item-over');
        }
      } else {
        this.item.select$.next(true);
      }
      this.itemClick.emit({ item: this.item, event: evt });
    }
    this.change = !this.change;
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

  handleExtendItem() {
    this.extendClick.emit({ item: this.item });
  }

  handleRemoveItem() {
    this.removeClick.emit({ item: this.item });
  }

  render() {
    return (
      <ion-item-sliding
        disabled={!this.canEdit || !this.reOrderDisabled || !!(this.item.selected && !this.item.isKidEnabled())}
        ref={el => (this.item.ref = el as HTMLIonItemSlidingElement)}
        onIonDrag={(e) => {
          if (e.detail.ratio < 0 && this.item.isKidEnabled()) {
            this.item.ref.close();
          }
        }}
      >
        <ion-item
          id={this.item.id}
          class={{
            'can-edit': this.canEdit,
            selected: !!this.item.selected && this.canEdit,
            'item-text': !this.isConclusion,
            'item-concl': this.isConclusion,
            'in-favor': this.isVoting && this.itemNumber <= this.item.getRoot().voteForTop,
            'vote-break': this.isVoteBreak
          }}
          lines="none"
          onClick={(ev) => this.handleItemClick(ev)}
          onMouseEnter={(evt: MouseEvent) => {
            const e = evt.target as HTMLElement;
            if (!this.item.selected && this.reOrderDisabled) {
              e.classList.add('item-over');
            }
          }}
          onMouseLeave={(evt: MouseEvent) => {
            const e = evt.target as HTMLElement;
            e.classList.remove('item-over');
          }}
        >
          {!this.isConclusion && 
            <d2-item-icon 
              itemNumber={this.itemNumber} 
              isEnabled={this.item.isKidEnabled()} 
              isNumeric={this.item.getRoot().numeric}
            ></d2-item-icon>
          }
          
          {this.isEditable && [
            <d2-text-editor 
              item={this.item}
              height={50}
              placeholder={this.textPlaceholder(this.item)}
              onTextChange={(e) => this.handleTextChange(e)}
              onKeyAction={(e) => this.handleKeyAction(e)}
            ></d2-text-editor>,
            <d2-expand-button 
              onExpandClick={() => this.handleExpandClick()}
            ></d2-expand-button>
          ]}
          
          {!this.isEditable && (
            <ion-label
              style={{ 'flex': 1, 'max-width': 'none' }}
              class={{
                'line-clamp': !this.reOrderDisabled,
                'ion-text-wrap': this.reOrderDisabled,
                'single-line': this.item.singleLine(),
                placeholder: !this.item.hasItemText(),
              }}
            >
              {this.renderLabel(this.item.getSupportItemText()) || this.textPlaceholder(this.item)}
              {this.item.isEvent && <p>{this.item.eventDate?.toLocaleString()}</p>}
              {!!this.item.url && this.renderSubscrLine(this.item)}
              {!!this.sourceNumbers.length && (
                <p class="item-subscript">
                  <ion-icon name="bookmark" size="small"></ion-icon>&nbsp;{this.sourceNumbers.join(',')}
                </p>
              )}
            </ion-label>
          )}
          
          {this.canEdit && 
            <d2-item-options 
              item={this.item}
              onOptionsClick={(e) => this.handleOptionsClick(e)}
            ></d2-item-options>
          }
          
          <ion-reorder slot="end"></ion-reorder>
        </ion-item>
        
        <ion-item-options
          side="start"
          onIonSwipe={() => this.handleExtendItem()}
        >
          {!this.item.isKidEnabled() &&
            <ion-item-option
              expandable
              class="secondary-btn-theme"
              onClick={() => this.handleExtendItem()}
            >
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </ion-item-option>
          }
        </ion-item-options>
        
        <ion-item-options
          side="end"
          onIonSwipe={() => this.handleRemoveItem()}
        >
          {this.item.canDisable() && (
            <ion-item-option
              expandable class="secondary-btn-theme"
              onClick={() => this.handleRemoveItem()}
            >
              <ion-icon name="cut-outline"></ion-icon>
            </ion-item-option>
          )}
          {!this.item.canDisable() && (
            <ion-item-option
              expandable color="warn"
              onClick={() => this.handleRemoveItem()}
            >
              <ion-icon name="trash-bin-outline"></ion-icon>
            </ion-item-option>
          )}
        </ion-item-options>
      </ion-item-sliding>
    );
  }
} 