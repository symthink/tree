declare module '@citation-js/core' {
  export class Cite {
    constructor(data: any);
    format(format: string, options?: any): string;
  }
} 