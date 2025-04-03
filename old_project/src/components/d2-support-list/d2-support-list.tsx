import { Component, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { SymThink, SymThinkDocument, StateEnum, StLogActionEnum } from '../../core/symthink.class';

@Component({
  tag: 'd2-support-list',
  styleUrl: 'd2-support-list.scss',
  shadow: true,
})
export class D2SupportList {
  @Prop() data: SymThink;
  @Prop() canEdit: boolean = false;
  @Prop() parentDoc: SymThinkDocument;
  @Prop() sourcList: { id: string; index: number; src: any }[] = [];
  
  @State() change: boolean = false;

  @Event() itemClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent, domrect?: DOMRect }>;
  @Event() optionsClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;
  @Event() extendClick: EventEmitter<{ item: SymThink }>;
  @Event() removeClick: EventEmitter<{ item: SymThink }>;
  @Event() expandClick: EventEmitter<{ item: SymThink }>;
  @Event() textChange: EventEmitter<{ item: SymThink, isModified: boolean }>;
  @Event() keyAction: EventEmitter<{ key: string, type?: string }>;
  @Event() reorderItems: EventEmitter<any>;

  get voting(): boolean {
    if (!this.parentDoc) {
      return false;
    }
    return this.parentDoc?.state$.getValue() === StateEnum.Voting;
  }

  get reOrderDisabled(): boolean {
    if (!this.parentDoc) {
      return true; // Default to disabled if no parentDoc
    }
    return this.parentDoc?.state$.getValue() !== StateEnum.Ranking;
  }

  getSourceNumbersForItem(index: number): number[] {
    if (!this.data.support[index] || !this.sourcList) return [];
    
    return this.sourcList.reduce((acc, curr, i) => {
      if (curr.id === this.data.support[index].id) acc.push(i + 1);
      return acc;
    }, []);
  }

  isConclusion(index: number): boolean {
    return this.data.lastSupIsConcl && index === this.data.support.length - 1;
  }

  isVoteBreak(index: number): boolean {
    if (!this.parentDoc || !this.voting) {
      return false;
    }
    return (index + 1) === this.parentDoc.voteForTop;
  }

  handleItemClick(item: SymThink, event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    if (item.url) {
      this.itemClick.emit({ 
        item: item, 
        event: event.detail.event 
      });
      return;
    }
    
    if (!this.parentDoc) {
      console.warn('parentDoc is missing in d2-support-list');
      return;
    }
    
    if (this.parentDoc.state$.getValue() === StateEnum.Viewing) {
      if (item.isKidEnabled()) {
        const ionItem = event.detail.event
          .composedPath()
          .find(
            (e) => (e as HTMLElement).localName === 'ion-item'
          ) as HTMLElement;
        let domrect = null;
        if (ionItem) {
          domrect = ionItem.getBoundingClientRect();
        }
        this.parentDoc.deselect();
        this.itemClick.emit({
          item: item,
          event: event.detail.event,
          domrect
        });
      }
    }
  }

  handleOptionsClick(event: CustomEvent<{ item: SymThink, event: MouseEvent | PointerEvent }>) {
    this.optionsClick.emit(event.detail);
  }

  handleExtendClick(event: CustomEvent<{ item: SymThink }>) {
    this.extendClick.emit(event.detail);
  }

  handleRemoveClick(event: CustomEvent<{ item: SymThink }>) {
    this.removeClick.emit(event.detail);
  }

  handleExpandClick(event: CustomEvent<{ item: SymThink }>) {
    this.expandClick.emit(event.detail);
  }

  handleTextChange(event: CustomEvent<{ item: SymThink, isModified: boolean }>) {
    this.textChange.emit(event.detail);
  }

  handleKeyAction(event: CustomEvent<{ key: string, type?: string }>) {
    this.keyAction.emit(event.detail);
  }

  handleReorderEvent(ev) {
    const itemMove = this.data.support.splice(ev.detail.from, 1)[0];
    this.data.support.splice(ev.detail.to, 0, itemMove);
    ev.detail.complete(false);
    this.data.logAction(StLogActionEnum.REORDER);
    this.reorderItems.emit();
    this.change = !this.change;
  }

  render() {
    if (!this.data?.support || !Array.isArray(this.data.support) || this.data.support.length === 0) {
      return <div>No support items found</div>;
    }
    
    return (
      <ion-reorder-group
        onIonItemReorder={(e) => this.handleReorderEvent(e)}
        disabled={this.reOrderDisabled}
      >
        {this.data.support.map((item, index) => (
          <d2-support-item 
            key={item.id}
            item={item}
            canEdit={this.canEdit}
            itemNumber={index + 1}
            isConclusion={this.isConclusion(index)}
            reOrderDisabled={this.reOrderDisabled}
            isVoting={this.voting}
            isVoteBreak={this.isVoteBreak(index)}
            sourceNumbers={this.getSourceNumbersForItem(index)}
            onItemClick={(e) => this.handleItemClick(item, e)}
            onOptionsClick={(e) => this.handleOptionsClick(e)}
            onExtendClick={(e) => this.handleExtendClick(e)}
            onRemoveClick={(e) => this.handleRemoveClick(e)}
            onExpandClick={(e) => this.handleExpandClick(e)}
            onTextChange={(e) => this.handleTextChange(e)}
            onKeyAction={(e) => this.handleKeyAction(e)}
          ></d2-support-item>
        ))}
      </ion-reorder-group>
    );
  }
} 