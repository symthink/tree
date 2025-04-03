import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { SymThink } from '../../core/symthink.class';

@Component({
  tag: 'd2-item-options',
  styleUrl: 'd2-item-options.scss',
  shadow: true,
})
export class D2ItemOptions {
  @Prop() item: SymThink;
  @Event() optionsClick: EventEmitter<{ item: SymThink, event: MouseEvent | PointerEvent }>;

  handleOptionsClick(evt: MouseEvent | PointerEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    this.optionsClick.emit({ item: this.item, event: evt });
  }

  render() {
    return (
      <ion-button
        class="opts-btn"
        slot="end"
        fill="solid"
        onClick={(evt: MouseEvent) => this.handleOptionsClick(evt)}
      >
        <ion-icon slot="icon-only" name="ellipsis-horizontal"></ion-icon>
      </ion-button>
    );
  }
} 