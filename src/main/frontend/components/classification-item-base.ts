import {LitElement} from 'lit';
import {state} from 'lit/decorators.js';
import {Classification, ClassificationUpdatedEvent} from '../domain.ts';

export abstract class ClassificationItemBase extends LitElement {

  // Disable Shadow DOM so Carbon Web Components styles (injected into document) apply correctly
  override createRenderRoot() {
    return this;
  }

  @state()
  protected _busy = false;

  protected notifyClassification(classification: Classification): void {
    this.dispatchEvent(new ClassificationUpdatedEvent(classification));
  }

  protected async withAction(action: () => Promise<void>): Promise<void> {
    this._busy = true;
    try {
      await action();
    } catch (e) {
      this.dispatchEvent(new CustomEvent('classification-error', {
        detail: e instanceof Error ? e.message : 'An unexpected error occurred.',
        bubbles: true,
        composed: true,
      }));
    } finally {
      this._busy = false;
    }
  }
}
