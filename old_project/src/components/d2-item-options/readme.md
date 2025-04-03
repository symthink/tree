# d2-item-options



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type       | Default     |
| -------- | --------- | ----------- | ---------- | ----------- |
| `item`   | --        |             | `SymThink` | `undefined` |


## Events

| Event          | Description | Type                                                                  |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `optionsClick` |             | `CustomEvent<{ item: SymThink; event: MouseEvent \| PointerEvent; }>` |


## Dependencies

### Used by

 - [d2-card-item](../d2-card-item)
 - [d2-support-item](../d2-support-item)

### Depends on

- ion-button
- ion-icon

### Graph
```mermaid
graph TD;
  d2-item-options --> ion-button
  d2-item-options --> ion-icon
  ion-button --> ion-ripple-effect
  d2-card-item --> d2-item-options
  d2-support-item --> d2-item-options
  style d2-item-options fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
