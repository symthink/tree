import { BehaviorSubject } from 'rxjs';

const SCHEMA_VERSION = 1;// current
export const MAX_KIDS = 10;

export enum REF_LABEL {
  Person = 'Person',
  Website = 'Website',
  Print = 'Print',
  Radio = 'Radio',
  TV = 'TV',
}

export enum FormatEnum {
  Default = 1,
  Review = 2, // puts 1st citation at top instead of byline
}

export interface IReference {
  id: string;
  label: REF_LABEL;
  url?: URL;
  name?: string;
  publisher?: string;
}

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

export enum SymType {
  Question = 'QUE',
  Claim = 'CLM',
  Idea = 'IDA',
  Event = 'EVT',
  SourceList = 'SRC',
}
export interface IDecision {
  ts: string; // ISO timestamp
  scope: string; // admin level or null
  uri?: string; // if scoped, then point to location of symthink decision in scope
  // Later add props for e.g:
  // type?: string; // 
  // dueDate?: string;
  subscription?: string;// "|" separated path of: userId/symthinkDocId/nodeId
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

// // everything below the top level
export interface ISymThink {
  id?: string;
  type: SymType; // default to Question
  label?: string;
  text?: string;
  url?: string;
  support?: ISymThink[];
  source?: CitationStyleLang[];
  lastSupIsConcl?: boolean;
  expires?: number; // for orphans only
  lastmod?: number;
  eventDate?: number; // UTC timestamp for Events only
  selected?: boolean;
  numeric?: boolean; // if true, use numbers instead of bullets for support icons
  decision?: IDecision;
  createdTime?: number;
  creator?: string;
  creatorId?: string;
  active?: boolean;
  focused?: boolean;
  ref?: any; // was HTMLIonItemSlidingElement;
}
export interface ISymThinkDocument extends ISymThink {
  $chemaver?: number;
  orphans?: ISymThink[];
  format?: FormatEnum;
  uid?: string; // collection/{uid} - firestore document ID
  timestamp?: any;
  decisions?: IDecision[];

  // metadata only for function onCreate copy to stmeta collection
  emails?: string[];
}

// Simplified SymThink class
export class Symthink {
  id: string;
  text: string;
  label: string | null;
  type: SymType;
  isEvent?: boolean;
  eventDate?: Date;
  url?: string;
  isRoot: boolean;
  selected: boolean;
  parent: Symthink | null;
  support: Symthink[];
  sources: CitationStyleLang[];

  select$: BehaviorSubject<boolean>;
  mod$: BehaviorSubject<any>;

  constructor(data: Partial<Symthink> = {}) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.text = data.text || '';
    this.label = data.label || null;
    this.type = data.type || SymType.Question;
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

  getRoot(): SymthinkDocument {
    if (this.isRoot) {
      return this as unknown as SymthinkDocument;
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
export class SymthinkDocument extends Symthink {
  state$: BehaviorSubject<StateEnum>;
  log$: BehaviorSubject<{ action: LogActionEnum, ts: number }>;
  voteForTop: number;

  constructor(data: Partial<SymthinkDocument> = {}) {
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

  private deselectAll(item: Symthink): void {
    if (item.support && item.support.length) {
      item.support.forEach(kid => {
        kid.select$.next(false);
        this.deselectAll(kid);
      });
    }
  }
}
