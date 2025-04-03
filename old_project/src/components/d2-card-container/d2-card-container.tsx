import {
  Component,
  h,
  Prop,
  State,
  Event,
  EventEmitter,
  Element
} from '@stencil/core';
import { Subject } from 'rxjs';
import {
  SymThinkDocument,
  SymThink,
  StLogActionEnum,
  CitationStyleLang,
  StateEnum,
} from '../../core/symthink.class';

@Component({
  tag: 'd2-card-container',
  styleUrl: 'd2-card-container.scss',
  shadow: true,
})
export class D2CardContainer {
  @Element() el: HTMLElement;

  /**
   * Cannot pass this via html attribute. Data must be an object reference,
   * so pass via JSX or Javascript.
   */
  @Prop() data: SymThinkDocument | SymThink;
  @Prop() canEdit = false;
  @Prop() notify?: Subject<string>;
  @Prop() domrect?: DOMRect;
  
  contentEl: HTMLIonContentElement;
  @State() checkboxHidden = true;
  @State() change = false;
  @Event() itemAction: EventEmitter<{
    action;
    value;
    domrect?: DOMRect;
    pointerEvent?: MouseEvent | PointerEvent;
  }>;
  @Event() docAction: EventEmitter<{ action; value }>;

  private listEl: HTMLIonListElement;
  private currIonTextareaEl: HTMLIonTextareaElement;
  private sourcList: { id: string; index: number; src: CitationStyleLang }[];
  private parentDoc: SymThinkDocument;

  get voting(): boolean {
    return this.parentDoc.state$.getValue() === StateEnum.Voting;
  }

  get ranking(): boolean {
    return this.parentDoc.state$.getValue() === StateEnum.Ranking;
  }

  get showMoreOptions(): boolean {
    return this.canEdit;
  }

  get reOrderDisabled(): boolean {
    return this.data.getRoot().state$.getValue() !== StateEnum.Ranking;
  }

  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  onItemSelectionChange(selected: boolean) {
    if (selected) {
      this.parentDoc.state$.next(StateEnum.Editing);
    } else {
      this.parentDoc.state$.next(StateEnum.Viewing);
    }
    this.change = !this.change;
  }

  onStateChange(state: StateEnum) {
    console.log('onStateChange', state)
    if (this.listEl) {
      this.listEl.closeSlidingItems();
    }
    this.change = !this.change;
  }

  componentWillLoad() {
    if (this.notify) {
      this.notify.subscribe((a) => this.onNotificationReceived(a));
    }
    this.parentDoc = this.data.getRoot();
    this.parentDoc.state$.subscribe(this.onStateChange.bind(this));

    if (this.data) {
      if (this.data.select$) {
        this.data.select$.subscribe(this.onItemSelectionChange.bind(this));
      }
      if (this.data.mod$) {
        this.data.mod$.subscribe(() => {
          this.sourcList = this.data.getShowableSources();
          this.change = !this.change;
        });
      }
      this.sourcList = this.data.getShowableSources();
      this.data.getRoot().log$.subscribe((a: { action: StLogActionEnum, ts: number }) => {
        if (a.action === StLogActionEnum.ADD_SOURCE) {
          this.sourcList = this.data.getShowableSources();
          this.change = !this.change;
        }
      });
    }
  }

  componentDidLoad() {
    console.log('componentDidLoad card container', this.domrect);
    console.log('Card container data:', this.data);
    console.log('Card container data.support:', this.data?.support);
    console.log('Card container hasKids():', this.data?.hasKids?.());
    
    if (this.domrect) {
      const y = this.domrect.y;
      const sharedEl = this.el.shadowRoot.querySelector('ion-item.shared');
      sharedEl.classList.add('animatable');
      const animation = sharedEl.animate(
        [
          { transform: `translate3d(0, ${y - 80}px, 0) scale3d(0.9, 0.9, 1)` },
          { transform: `translate3d(0, 0, 0) scale3d(1, 1, 1)` },
        ],
        {
          duration: 700,
          easing: 'ease-in-out',
        }
      );
      animation.onfinish = () => {
        sharedEl.classList.remove('animatable');
      };
    }
  }

  componentWillRender() {
    if (this.currIonTextareaEl) {
      this.currIonTextareaEl = null;
    }
  }

  async componentDidRender() {
    this.currIonTextareaEl = this.contentEl.querySelector('ion-textarea') as HTMLIonTextareaElement;
    if (this.currIonTextareaEl) {
      this.currIonTextareaEl.autoGrow = true;
      const ta = await this.currIonTextareaEl.getInputElement();
      if (ta) {
        ta.addEventListener('focus', () => {
          this.itemAction.emit({ action: 'textarea-focused', value: null })
        })
        ta.focus()
      }
    }
    
    // must be done after every render in case new supports are added
    if (this.data.support && this.data.support.length) {
      this.data.support.map((itm) => {
        itm.select$.subscribe(this.onItemSelectionChange.bind(this));
      });
    }
  }

  async onNotificationReceived(a: string) {
    await this.listEl.closeSlidingItems();
    switch (a) {
      case 'external-mod':
        // just for re-render
        this.change = !this.change;
        break;
      default:
    }
  }

  modified(percDiff?: number) {
    this.change = !this.change;
    this.docAction.emit({ action: 'modified', value: percDiff || null });
  }

  // Event Handlers for child components
  handleMainItemClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    const item = event.detail.item;
    const ev = event.detail.event;
    ev.stopPropagation();
    
    if (this.parentDoc.state$.getValue() !== StateEnum.Viewing) {
      return;
    }
    
    const el = ev.target as HTMLElement;
    const ionItem = el.closest('ion-item');
    if (ionItem) {
      ionItem.classList.remove('item-over');
    }
    
    item.select$.next(true);
    if (!this.data.isRoot && !this.canEdit) {
      this.docAction.emit({
        action: 'go-back',
        value: item,
      });
    }
  }

  handleMainItemOptionsClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    const item = event.detail.item;
    const evt = event.detail.event;
    
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    
    this.itemAction.emit({
      action: 'item-opts-clicked',
      value: item,
      pointerEvent: evt,
    });
  }

  handleMainItemExpandClick(event: CustomEvent<{ item: SymThink }>) {
    this.itemAction.emit({ action: 'edit-full', value: event.detail.item });
  }

  handleSupportItemClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent, domrect?: DOMRect }>) {
    const item = event.detail.item;
    
    if (item.url) {
      this.itemAction.emit({ action: 'subcription-clicked', value: item.url });
    } else if (this.parentDoc.state$.getValue() === StateEnum.Viewing) {
      if (item.isKidEnabled()) {
        this.parentDoc.deselect();
        this.itemAction.emit({
          action: 'support-clicked',
          value: item,
          domrect: event.detail.domrect,
        });
      } else {
        item.select$.next(true);
      }
    }
  }

  handleSupportItemOptionsClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    const item = event.detail.item;
    const evt = event.detail.event;
    
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    
    this.itemAction.emit({
      action: 'item-opts-clicked',
      value: item,
      pointerEvent: evt,
    });
  }

  handleSupportItemExtendClick(event: CustomEvent<{ item: SymThink }>) {
    this.itemAction.emit({ action: 'slide-opt-extend', value: event.detail.item });
  }

  handleSupportItemRemoveClick(event: CustomEvent<{ item: SymThink }>) {
    const item = event.detail.item;
    
    if (item.canDisable()) {
      this.itemAction.emit({ action: 'slide-opt-disablekids', value: item });
    } else {
      this.itemAction.emit({ action: 'slide-opt-recycle', value: item });
    }
  }

  handleSupportItemExpandClick(event: CustomEvent<{ item: SymThink }>) {
    this.itemAction.emit({ action: 'edit-full', value: event.detail.item });
  }

  handleTextChange() {
    this.docAction.emit({ action: 'modified', value: null });
  }

  handleKeyAction(event: CustomEvent<{ key: string, type?: string }>) {
    if (event.detail.key !== 'Enter') return;
    
    let nextItem: SymThink;
    if (event.detail.type === 'top') {
      // if has child items, then focus on first child item
      if (this.data.hasKids()) {
        nextItem = this.data.support[0];
      }
      else {
        if (!this.data.isKidEnabled()) {
          this.data.enableKids();
        }
        nextItem = this.data.addNextDefault();
      }
    } else {
      // if has next sibling, then focus on next sibling
      const idx = this.data.support.findIndex((i) => i.selected);
      if (idx === -1) {
        console.log('no selected item found')
        return;
      }
      if (this.data.support[idx + 1]) {
        nextItem = this.data.support[idx + 1];
      } else {
        // if no next sibling, then make next sibling and focus on it
        nextItem = this.data.addNextDefault();
      }
    }
    if (nextItem) {
      nextItem.select$.next(true);
    }
    this.change = !this.change;
  }

  handleReorderItems() {
    this.modified();
  }

  onIonContentClick(e: MouseEvent | PointerEvent) {
    if (this.data.selected) {
      this.data.select$.next(false);
    } else if (this.data.hasKids()) {
      const el: HTMLElement = e.composedPath().shift() as HTMLElement;
      if (el.localName !== 'textarea') {
        this.data.support.map((sup) => {
          if (sup.selected) {
            sup.select$.next(false);
          }
        });
      }
    }
  }

  onAddSourceClick() {
    if (this.currIonTextareaEl) {
      return;
    }
    this.itemAction.emit({
      action: 'add-source',
      value: this.data,
    });
  }

  renderTopItem() {
    const sourceNumbers = this.sourcList?.reduce((acc, curr, i) => {
      if (curr.id === this.data.id) acc.push(i + 1);
      return acc;
    }, []);
    
    return (
      <d2-card-item
        item={this.data as SymThink}
        canEdit={this.canEdit}
        parentDoc={this.parentDoc}
        sourceNumbers={sourceNumbers}
        onItemClick={(e) => this.handleMainItemClick(e)}
        onOptionsClick={(e) => this.handleMainItemOptionsClick(e)}
        onExpandClick={(e) => this.handleMainItemExpandClick(e)}
        onTextChange={() => this.handleTextChange()}
        onKeyAction={(e) => this.handleKeyAction(e)}
      ></d2-card-item>
    );
  }

  renderSupportItems() {
    console.log('Rendering support items:');
    console.log('- data:', this.data);
    console.log('- hasKids():', this.data?.hasKids?.());
    console.log('- support array:', this.data?.support);
    
    // Try to render support items even if hasKids() returns false
    // but only if the support array exists and has items
    if (!this.data?.support || !Array.isArray(this.data.support) || this.data.support.length === 0) {
      console.log('No support items to render');
      return null;
    }
    
    console.log('Support items found, rendering d2-support-list');
    return (
      <d2-support-list
        data={this.data as SymThink}
        canEdit={this.canEdit}
        parentDoc={this.parentDoc}
        sourcList={this.sourcList}
        onItemClick={(e) => this.handleSupportItemClick(e)}
        onOptionsClick={(e) => this.handleSupportItemOptionsClick(e)}
        onExtendClick={(e) => this.handleSupportItemExtendClick(e)}
        onRemoveClick={(e) => this.handleSupportItemRemoveClick(e)}
        onExpandClick={(e) => this.handleSupportItemExpandClick(e)}
        onTextChange={() => this.handleTextChange()}
        onKeyAction={(e) => this.handleKeyAction(e)}
        onReorderItems={() => this.handleReorderItems()}
      ></d2-support-list>
    );
  }

  renderSources() {
    if (!this.sourcList?.length) return null;
    
    return (
      <d2-sources-list
        sourceList={this.sourcList}
        canEdit={this.canEdit}
      ></d2-sources-list>
    );
  }

  render() {
    return [
      <ion-content 
        scrollEvents={true} 
        onIonScroll={(e) => this.docAction.emit({ action: 'scroll', value: e.detail.currentY })}
        fullscreen={true}
        ref={(el) => (this.contentEl = el as HTMLIonContentElement)}
        onClick={(e) => this.onIonContentClick(e)}
        class={{
          editing: this.data.selected,
          'sym-text': true,
        }}
      >
        <slot name="card-top"></slot>
        <br />
        {!this.data.isRoot && !this.canEdit && <div class="back-arrow">⟵</div>}
        <ion-list ref={(el) => (this.listEl = el as HTMLIonListElement)}>
          {this.renderTopItem()}
          {this.renderSupportItems()}
        </ion-list>
        <slot name="card-list-bottom"></slot>

        {this.canEdit && !this.data.isRoot && <div class="sources-border">
          <div>§</div>
        </div>}

        {this.renderSources()}
        <slot name="card-bottom"></slot>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </ion-content>,
    ];
  }
} 