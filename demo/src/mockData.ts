import { BehaviorSubject } from 'rxjs';

// Simplified enums for states
export enum StateEnum {
  Viewing = 'Viewing',
  Editing = 'Editing',
  Voting = 'Voting',
  Ranking = 'Ranking'
}

export enum LogActionEnum {
  ADD_SOURCE = 'ADD_SOURCE',
  REMOVE_SOURCE = 'REMOVE_SOURCE',
  ADD_ITEM = 'ADD_ITEM',
  REMOVE_ITEM = 'REMOVE_ITEM',
  MODIFY_ITEM = 'MODIFY_ITEM'
}

// Mock of the CitationStyleLang interface
export interface CitationStyleLang {
  id: string;
  title?: string;
  URL?: string;
  author?: string[];
  issued?: { 'date-parts': number[][] };
  publisher?: string;
  type?: string;
}

// Simplified SymThink class
export class SymThink {
  id: string;
  text: string;
  label: string | null;
  type: string;
  isEvent?: boolean;
  eventDate?: Date;
  url?: string;
  isRoot: boolean;
  selected: boolean;
  parent: SymThink | null;
  support: SymThink[];
  sources: CitationStyleLang[];
  
  select$: BehaviorSubject<boolean>;
  mod$: BehaviorSubject<any>;
  
  constructor(data: Partial<SymThink> = {}) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.text = data.text || '';
    this.label = data.label || null;
    this.type = data.type || 'default';
    this.isEvent = data.isEvent || false;
    this.eventDate = data.eventDate;
    this.url = data.url;
    this.isRoot = data.isRoot || false;
    this.selected = data.selected || false;
    this.parent = data.parent || null;
    this.support = data.support || [];
    this.sources = data.sources || [];
    
    this.select$ = new BehaviorSubject<boolean>(this.selected);
    this.mod$ = new BehaviorSubject<any>(null);
    
    // Set up parent-child relationship for all support items
    this.support.forEach(item => {
      item.parent = this;
    });
  }
  
  getRoot(): SymThinkDocument {
    if (this.isRoot) {
      return this as unknown as SymThinkDocument;
    }
    if (!this.parent) {
      throw new Error('Item has no parent and is not a root');
    }
    return this.parent.getRoot();
  }
  
  hasKids(): boolean {
    return this.support.length > 0;
  }
  
  isKidEnabled(): boolean {
    return this.hasKids() && this.support.some(kid => kid.text && kid.text.trim().length > 0);
  }
  
  getCurrentItemText(withLabel = false): string {
    if (withLabel && this.label) {
      return `${this.label}: ${this.text}`;
    }
    return this.text;
  }
  
  getSupportItemText(): string {
    return this.text;
  }
  
  hasItemText(): boolean {
    return !!(this.text && this.text.trim().length > 0);
  }
  
  getShowableSources(): CitationStyleLang[] {
    return this.sources;
  }
}

// Simplified SymThinkDocument class (extends SymThink)
export class SymThinkDocument extends SymThink {
  state$: BehaviorSubject<StateEnum>;
  log$: BehaviorSubject<{ action: LogActionEnum, ts: number }>;
  voteForTop: number;
  
  constructor(data: Partial<SymThinkDocument> = {}) {
    super({ ...data, isRoot: true });
    this.state$ = new BehaviorSubject<StateEnum>(data.state$ ? data.state$.getValue() : StateEnum.Viewing);
    this.log$ = new BehaviorSubject<{ action: LogActionEnum, ts: number }>({ 
      action: LogActionEnum.ADD_ITEM, 
      ts: Date.now() 
    });
    this.voteForTop = data.voteForTop || 0;
  }
  
  deselect(): void {
    this.select$.next(false);
    this.deselectAll(this);
  }
  
  private deselectAll(item: SymThink): void {
    if (item.support && item.support.length) {
      item.support.forEach(kid => {
        kid.select$.next(false);
        this.deselectAll(kid);
      });
    }
  }
}

// Create mock data
export const createMockData = (): SymThinkDocument => {
  // Create sources
  const sources: CitationStyleLang[] = [
    {
      id: 's1',
      title: 'Understanding React Hooks',
      URL: 'https://reactjs.org/docs/hooks-intro.html',
      author: ['React Team'],
      issued: { 'date-parts': [[2019, 2, 6]] },
      publisher: 'Facebook Open Source',
      type: 'webpage'
    },
    {
      id: 's2',
      title: 'React Native for Cross-Platform Development',
      URL: 'https://reactnative.dev/',
      author: ['Facebook'],
      issued: { 'date-parts': [[2020, 1, 1]] },
      publisher: 'Facebook Open Source',
      type: 'webpage'
    }
  ];
  
  // Create support items
  const supportItems = [
    new SymThink({
      text: 'React Hooks simplify state management in functional components',
      type: 'evidence',
      sources: [sources[0]]
    }),
    new SymThink({
      text: 'React Native allows for code sharing between web and mobile',
      type: 'evidence',
      sources: [sources[1]]
    }),
    new SymThink({
      text: 'Component libraries increase development speed',
      type: 'claim'
    }),
    new SymThink({
      text: 'MVC architecture separates concerns but adds complexity',
      type: 'objection'
    })
  ];
  
  // Create nested support items for the first support item
  const nestedSupportItems = [
    new SymThink({
      text: 'useState replaces this.state and this.setState',
      type: 'idea'
    }),
    new SymThink({
      text: 'useEffect combines componentDidMount, componentDidUpdate, and componentWillUnmount',
      type: 'idea'
    })
  ];
  
  // Add nested support to the first support item
  supportItems[0].support = nestedSupportItems;
  
  // Create the document with main item and support
  const document = new SymThinkDocument({
    text: 'Modern React development has several advantages over traditional approaches',
    label: 'Main Thesis',
    type: 'claim',
    support: supportItems,
    sources: sources
  });
  
  return document;
}; 