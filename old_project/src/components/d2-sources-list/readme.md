# d2-sources-list



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute  | Description | Type                                                       | Default |
| ------------ | ---------- | ----------- | ---------------------------------------------------------- | ------- |
| `canEdit`    | `can-edit` |             | `boolean`                                                  | `false` |
| `sourceList` | --         |             | `{ id: string; index: number; src: CitationStyleLang; }[]` | `[]`    |


## Dependencies

### Used by

 - [d2-card-container](../d2-card-container)

### Depends on

- ion-list
- [d2-src-metadata](../d2-src-metadata)

### Graph
```mermaid
graph TD;
  d2-sources-list --> ion-list
  d2-sources-list --> d2-src-metadata
  d2-src-metadata --> ion-item-sliding
  d2-src-metadata --> ion-item
  d2-src-metadata --> ion-label
  d2-src-metadata --> ion-item-options
  d2-src-metadata --> ion-item-option
  d2-src-metadata --> ion-icon
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-item --> ion-note
  ion-item-option --> ion-ripple-effect
  d2-card-container --> d2-sources-list
  style d2-sources-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
