import { Component, h, Prop } from '@stencil/core';
import { Bullets } from '../../core/symthink.class';

@Component({
  tag: 'd2-item-icon',
  styleUrl: 'd2-item-icon.scss',
  shadow: true,
})
export class D2ItemIcon {
  @Prop() itemNumber: number = 0;
  @Prop() isEnabled: boolean = true;
  @Prop() isNumeric: boolean = false;

  render() {
    const bullet = Bullets.find((b) => b.x === (this.isNumeric ? this.itemNumber : 0));
    const charLabel = this.isEnabled ? bullet.full : bullet.circ;
    let classList = {
      bullet: true,
      'bullet-full': this.isEnabled && !this.isNumeric,
      'bullet-hollow': !this.isEnabled && !this.isNumeric,
      numbull: this.isNumeric,
    };

    return (
      <span slot="start" class={classList}>
        {charLabel}
      </span>
    );
  }
} 