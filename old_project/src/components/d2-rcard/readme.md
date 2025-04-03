# d2-rcard



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute  | Description                                                                                           | Type                           | Default     |
| --------- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| `canEdit` | `can-edit` |                                                                                                       | `boolean`                      | `false`     |
| `data`    | --         | Cannot pass this via html attribute. Data must be an object reference, so pass via JSX or Javascript. | `SymThink \| SymThinkDocument` | `undefined` |
| `domrect` | --         |                                                                                                       | `DOMRect`                      | `undefined` |
| `notify`  | --         |                                                                                                       | `Subject<string>`              | `undefined` |


## Events

| Event        | Description | Type                                                                                                      |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------- |
| `docAction`  |             | `CustomEvent<{ action: any; value: any; }>`                                                               |
| `itemAction` |             | `CustomEvent<{ action: any; value: any; domrect?: DOMRect; pointerEvent?: MouseEvent \| PointerEvent; }>` |


## Dependencies

### Depends on

- ion-button
- ion-icon
- ion-reorder-group
- ion-item-sliding
- ion-item
- ion-textarea
- ion-label
- ion-reorder
- ion-item-options
- ion-item-option
- ion-list
- [d2-src-metadata](../d2-src-metadata)
- ion-content

### Graph
```mermaid
graph TD;
  d2-rcard --> ion-button
  d2-rcard --> ion-icon
  d2-rcard --> ion-reorder-group
  d2-rcard --> ion-item-sliding
  d2-rcard --> ion-item
  d2-rcard --> ion-textarea
  d2-rcard --> ion-label
  d2-rcard --> ion-reorder
  d2-rcard --> ion-item-options
  d2-rcard --> ion-item-option
  d2-rcard --> ion-list
  d2-rcard --> d2-src-metadata
  d2-rcard --> ion-content
  ion-button --> ion-ripple-effect
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-item --> ion-note
  ion-reorder --> ion-icon
  ion-item-option --> ion-ripple-effect
  d2-src-metadata --> ion-item-sliding
  d2-src-metadata --> ion-item
  d2-src-metadata --> ion-label
  d2-src-metadata --> ion-item-options
  d2-src-metadata --> ion-item-option
  d2-src-metadata --> ion-icon
  style d2-rcard fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
