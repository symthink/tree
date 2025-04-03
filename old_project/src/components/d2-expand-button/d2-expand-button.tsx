import { Component, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'd2-expand-button',
  styleUrl: 'd2-expand-button.scss',
  shadow: true,
})
export class D2ExpandButton {
  @Event() expandClick: EventEmitter<void>;

  handleClick() {
    this.expandClick.emit();
  }

  render() {
    return (
      <ion-button
        slot="end" 
        fill="clear" 
        style={{ 
          height: '100%', 
          backgroundColor: '#e8e8e8', 
          color: 'black', 
          marginRight: '0px' 
        }}
        onClick={() => this.handleClick()}
      >
        <ion-icon slot="icon-only" size="medium" name="expand-outline"></ion-icon>
      </ion-button>
    );
  }
} 