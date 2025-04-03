# d2-support-item



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type       | Default     |
| ----------------- | ------------------- | ----------- | ---------- | ----------- |
| `canEdit`         | `can-edit`          |             | `boolean`  | `false`     |
| `isConclusion`    | `is-conclusion`     |             | `boolean`  | `false`     |
| `isVoteBreak`     | `is-vote-break`     |             | `boolean`  | `false`     |
| `isVoting`        | `is-voting`         |             | `boolean`  | `false`     |
| `item`            | --                  |             | `SymThink` | `undefined` |
| `itemNumber`      | `item-number`       |             | `number`   | `0`         |
| `reOrderDisabled` | `re-order-disabled` |             | `boolean`  | `true`      |
| `sourceNumbers`   | --                  |             | `number[]` | `[]`        |


## Events

| Event          | Description | Type                                                                  |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `expandClick`  |             | `CustomEvent<{ item: SymThink; }>`                                    |
| `extendClick`  |             | `CustomEvent<{ item: SymThink; }>`                                    |
| `itemClick`    |             | `CustomEvent<{ item: SymThink; event: MouseEvent \| PointerEvent; }>` |
| `keyAction`    |             | `CustomEvent<{ key: string; type?: string; }>`                        |
| `optionsClick` |             | `CustomEvent<{ item: SymThink; event: MouseEvent \| PointerEvent; }>` |
| `removeClick`  |             | `CustomEvent<{ item: SymThink; }>`                                    |
| `textChange`   |             | `CustomEvent<{ item: SymThink; isModified: boolean; }>`               |


## Dependencies

### Used by

 - [d2-support-list](../d2-support-list)

### Depends on

- ion-icon
- ion-item-sliding
- ion-item
- [d2-item-icon](../d2-item-icon)
- [d2-text-editor](../d2-text-editor)
- [d2-expand-button](../d2-expand-button)
- ion-label
- [d2-item-options](../d2-item-options)
- ion-reorder
- ion-item-options
- ion-item-option

### Graph
```mermaid
graph TD;
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
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-item --> ion-note
  d2-text-editor --> ion-textarea
  d2-expand-button --> ion-button
  d2-expand-button --> ion-icon
  ion-button --> ion-ripple-effect
  d2-item-options --> ion-button
  d2-item-options --> ion-icon
  ion-reorder --> ion-icon
  ion-item-option --> ion-ripple-effect
  d2-support-list --> d2-support-item
  style d2-support-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
