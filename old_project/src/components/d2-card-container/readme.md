# d2-card-container



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

- [d2-card-item](../d2-card-item)
- [d2-support-list](../d2-support-list)
- [d2-sources-list](../d2-sources-list)
- ion-content
- ion-list

### Graph
```mermaid
graph TD;
  d2-card-container --> d2-card-item
  d2-card-container --> d2-support-list
  d2-card-container --> d2-sources-list
  d2-card-container --> ion-content
  d2-card-container --> ion-list
  d2-card-item --> ion-item
  d2-card-item --> d2-text-editor
  d2-card-item --> d2-expand-button
  d2-card-item --> ion-label
  d2-card-item --> ion-icon
  d2-card-item --> d2-item-options
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-item --> ion-note
  d2-text-editor --> ion-textarea
  d2-expand-button --> ion-button
  d2-expand-button --> ion-icon
  ion-button --> ion-ripple-effect
  d2-item-options --> ion-button
  d2-item-options --> ion-icon
  d2-support-list --> ion-reorder-group
  d2-support-list --> d2-support-item
  d2-support-item --> ion-icon
  d2-support-item --> ion-item-sliding
  d2-support-item --> ion-item
  d2-support-item --> d2-item-icon
  d2-support-item --> d2-text-editor
  d2-support-item --> d2-expand-button
  d2-support-item --> ion-label
  d2-support-item --> d2-item-options
  d2-support-item --> ion-reorder
  d2-support-item --> ion-item-options
  d2-support-item --> ion-item-option
  ion-reorder --> ion-icon
  ion-item-option --> ion-ripple-effect
  d2-sources-list --> ion-list
  d2-sources-list --> d2-src-metadata
  d2-src-metadata --> ion-item-sliding
  d2-src-metadata --> ion-item
  d2-src-metadata --> ion-label
  d2-src-metadata --> ion-item-options
  d2-src-metadata --> ion-item-option
  d2-src-metadata --> ion-icon
  style d2-card-container fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
