# d2-card-item



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute  | Description | Type               | Default     |
| --------------- | ---------- | ----------- | ------------------ | ----------- |
| `canEdit`       | `can-edit` |             | `boolean`          | `false`     |
| `item`          | --         |             | `SymThink`         | `undefined` |
| `parentDoc`     | --         |             | `SymThinkDocument` | `undefined` |
| `sourceNumbers` | --         |             | `number[]`         | `[]`        |


## Events

| Event          | Description | Type                                                                  |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `expandClick`  |             | `CustomEvent<{ item: SymThink; }>`                                    |
| `itemClick`    |             | `CustomEvent<{ item: SymThink; event: MouseEvent \| PointerEvent; }>` |
| `keyAction`    |             | `CustomEvent<{ key: string; type?: string; }>`                        |
| `optionsClick` |             | `CustomEvent<{ item: SymThink; event: MouseEvent \| PointerEvent; }>` |
| `textChange`   |             | `CustomEvent<{ item: SymThink; isModified: boolean; }>`               |


## Dependencies

### Used by

 - [d2-card-container](../d2-card-container)

### Depends on

- ion-item
- [d2-text-editor](../d2-text-editor)
- [d2-expand-button](../d2-expand-button)
- ion-label
- ion-icon
- [d2-item-options](../d2-item-options)

### Graph
```mermaid
graph TD;
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
  d2-card-container --> d2-card-item
  style d2-card-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
