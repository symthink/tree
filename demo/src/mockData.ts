import { SymthinkDocument, Symthink, CitationStyleLang } from '../../src/core/symthink';

// Create mock data
export const createMockData = (): SymthinkDocument => {
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
    new Symthink({
      text: 'React Hooks simplify state management in functional components',
      type: 'evidence',
      sources: [sources[0]]
    }),
    new Symthink({
      text: 'React Native allows for code sharing between web and mobile',
      type: 'evidence',
      sources: [sources[1]]
    }),
    new Symthink({
      text: 'Component libraries increase development speed',
      type: 'claim'
    }),
    new Symthink({
      text: 'MVC architecture separates concerns but adds complexity',
      type: 'objection'
    })
  ];
  
  // Create nested support items for the first support item
  const nestedSupportItems = [
    new Symthink({
      text: 'useState replaces this.state and this.setState',
      type: 'idea'
    }),
    new Symthink({
      text: 'useEffect combines componentDidMount, componentDidUpdate, and componentWillUnmount',
      type: 'idea'
    })
  ];
  
  // Add nested support to the first support item
  supportItems[0].support = nestedSupportItems;
  
  // Create the document with main item and support
  const document = new SymthinkDocument({
    text: 'Modern React development has several advantages over traditional approaches',
    label: 'Main Thesis',
    type: 'claim',
    support: supportItems,
    sources: sources
  });
  
  return document;
}; 