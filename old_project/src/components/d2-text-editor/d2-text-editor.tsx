import { Component, h, Prop, Event, EventEmitter, Method } from '@stencil/core';
import { IonTextareaCustomEvent } from '@ionic/core';
import { SymThink, CardRules, sympunkRegex, sympunkReplacementRegex, applySympunk } from '../../core/symthink.class';

@Component({
  tag: 'd2-text-editor',
  styleUrl: 'd2-text-editor.scss',
  shadow: true,
})
export class D2TextEditor {
  @Prop() item: SymThink;
  @Prop() placeholder: string = '';
  @Prop() height: number = 50;
  @Prop() isTopItem: boolean = false;
  
  @Event() textChange: EventEmitter<{ item: SymThink, isModified: boolean }>;
  @Event() keyAction: EventEmitter<{ key: string, type?: string }>;
  
  private textareaEl: HTMLIonTextareaElement;

  @Method()
  async focus() {
    if (this.textareaEl) {
      const ta = await this.textareaEl.getInputElement();
      if (ta) {
        ta.focus();
      }
    }
  }

  onKeyUp(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      this.keyAction.emit({ key: 'Enter', type: this.isTopItem ? 'top' : undefined });
    }
  }

  onTextareaInput(evt: IonTextareaCustomEvent<InputEvent>) {
    evt.stopPropagation();
    evt.preventDefault();
    const ta = evt.target as HTMLIonTextareaElement;
    let newVal = ta.value.trim();
    if (!sympunkRegex.test(newVal)) {
      // no sympunk found, check for regular punctuation
      for (let cardType of CardRules) {
        if (cardType.swap && cardType.swap.test(newVal)) {
          newVal = newVal.replace(cardType.swap, cardType.char);
          this.item.type = cardType.type;
          break;
        }
      }
    }
    this.item.text = ta.value;
    this.textChange.emit({ item: this.item, isModified: true });
  }

  onTextareaBlur(evt: IonTextareaCustomEvent<any>) {
    const ta = evt.target as HTMLIonTextareaElement;
    const typ = CardRules.find((r) => r.type === this.item.type);
    if (typ && ta && ta.value && ta.value.length) {
      let newVal = ta.value.trim();
      let added = false;
      if (!sympunkRegex.test(newVal)) {
        // no sympunk found, check for regular punctuation
        for (let cardType of CardRules) {
          if (cardType.swap && cardType.swap.test(newVal)) {
            newVal = newVal.replace(cardType.swap, cardType.char);
            this.item.type = cardType.type;
            added = true;
            break;
          }
        }
      }
      if (!added) {
        newVal = applySympunk(newVal, this.item.type);
      }

      // capitalize first letter of each sentence
      let match;
      const sentences = [];
      while ((match = sympunkReplacementRegex.exec(newVal)) !== null) {
        let tmp: string = match[0];
        tmp = tmp.trim();
        tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1);
        sentences.push(tmp);
      }
      this.item.text = sentences.length ? sentences.join(' ').trim() : newVal;
      if (this.item.text?.indexOf(':') !== -1) {
        const [label, text] = this.item.text.split(':');
        this.item.label = label ? label.trim() : null;
        this.item.text = (text||'').trim();
      } else {
        this.item.label = null;
      }
      this.textChange.emit({ item: this.item, isModified: true });
    }
  }

  render() {
    return (
      <ion-textarea
        ref={(el) => (this.textareaEl = el as HTMLIonTextareaElement)}
        id={this.item.id}
        onIonInput={(e) => this.onTextareaInput(e)}
        onIonBlur={(e) => this.onTextareaBlur(e)}
        onKeyUp={(e) => this.onKeyUp(e)}
        value={this.isTopItem ? this.item.getCurrentItemText(true) : this.item.getSupportItemText()}
        maxlength={280}
        spellcheck={true}
        autocapitalize="sentences"
        autocorrect={'off'}
        wrap={'soft'}
        autofocus={true}
        autoGrow={true}
        inputmode={'text'}
        style={{
          'caret-color': 'currentColor',
          'height': `${this.height}px`,
        }}
        placeholder={this.placeholder}
        enterkeyhint="done"
      ></ion-textarea>
    );
  }
} 