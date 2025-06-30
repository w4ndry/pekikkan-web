// SEO utility functions

export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

export const generateKeywords = (text: string, additionalKeywords: string[] = []): string[] => {
  // Extract meaningful words from text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !commonWords.includes(word));

  // Get word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by frequency and take top words
  const topWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return [...new Set([...additionalKeywords, ...topWords])];
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const generateCanonicalUrl = (path: string, baseUrl: string = 'https://pekikkan.com'): string => {
  const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
};

export const generateOpenGraphImage = (quote: string, author: string): string => {
  // In a real app, this would generate a dynamic OG image
  // For now, return a placeholder that could be generated server-side
  const encodedQuote = encodeURIComponent(quote.substring(0, 100));
  const encodedAuthor = encodeURIComponent(author);
  
  return `https://pekikkan.com/api/og?quote=${encodedQuote}&author=${encodedAuthor}`;
};

export const extractTextFromHTML = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const generateBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', href: '/' }];

  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({
      name,
      href: currentPath,
      isLast: index === paths.length - 1
    });
  });

  return breadcrumbs;
};

// Common words to exclude from keyword extraction
const commonWords = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our',
  'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two',
  'who', 'boy', 'did', 'does', 'let', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'oil',
  'sit', 'set', 'run', 'eat', 'far', 'sea', 'eye', 'ago', 'air', 'add', 'art', 'ask', 'big', 'box',
  'car', 'cry', 'cut', 'end', 'few', 'got', 'gun', 'hit', 'job', 'lot', 'map', 'mix', 'own', 'pay',
  'put', 'red', 'run', 'say', 'she', 'sit', 'six', 'ten', 'top', 'try', 'use', 'war', 'win', 'yes',
  'yet', 'zoo', 'able', 'back', 'ball', 'band', 'bank', 'base', 'beat', 'been', 'bell', 'best',
  'bill', 'bird', 'blow', 'blue', 'boat', 'body', 'bone', 'book', 'born', 'both', 'bowl', 'burn',
  'busy', 'call', 'came', 'camp', 'card', 'care', 'case', 'cash', 'cast', 'cell', 'chat', 'chip',
  'city', 'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool', 'copy', 'corn', 'cost',
  'crew', 'crop', 'dark', 'data', 'date', 'dawn', 'days', 'dead', 'deal', 'dean', 'dear', 'debt',
  'deep', 'deny', 'desk', 'dial', 'diet', 'disk', 'done', 'door', 'dose', 'down', 'draw', 'drew',
  'drop', 'drug', 'dual', 'duck', 'duke', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy',
  'edge', 'else', 'even', 'ever', 'evil', 'exit', 'face', 'fact', 'fail', 'fair', 'fall', 'farm',
  'fast', 'fate', 'fear', 'feed', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'find',
  'fine', 'fire', 'firm', 'fish', 'five', 'flag', 'flat', 'flew', 'flow', 'food', 'foot', 'ford',
  'form', 'fort', 'four', 'free', 'from', 'fuel', 'full', 'fund', 'gain', 'game', 'gate', 'gave',
  'gear', 'gene', 'gift', 'girl', 'give', 'glad', 'goal', 'goes', 'gold', 'golf', 'gone', 'good',
  'grab', 'gray', 'grew', 'grow', 'gulf', 'hair', 'half', 'hall', 'hand', 'hang', 'hard', 'harm',
  'hate', 'have', 'head', 'hear', 'heat', 'held', 'hell', 'help', 'here', 'hero', 'hide', 'high',
  'hill', 'hint', 'hire', 'hold', 'hole', 'holy', 'home', 'hope', 'host', 'hour', 'huge', 'hung',
  'hunt', 'hurt', 'icon', 'idea', 'inch', 'into', 'iron', 'item', 'jail', 'jane', 'jean', 'john',
  'join', 'jump', 'june', 'jury', 'just', 'keen', 'keep', 'kent', 'kept', 'kick', 'kill', 'kind',
  'king', 'knee', 'knew', 'know', 'lack', 'lady', 'laid', 'lake', 'land', 'lane', 'last', 'late',
  'lead', 'left', 'less', 'life', 'lift', 'like', 'line', 'link', 'list', 'live', 'load', 'loan',
  'lock', 'long', 'look', 'lord', 'lose', 'loss', 'lost', 'loud', 'love', 'luck', 'made', 'mail',
  'main', 'make', 'male', 'mall', 'many', 'mark', 'mass', 'mate', 'math', 'meal', 'mean', 'meat',
  'meet', 'menu', 'mere', 'mile', 'milk', 'mind', 'mine', 'miss', 'mode', 'mood', 'moon', 'more',
  'most', 'move', 'much', 'must', 'name', 'navy', 'near', 'neck', 'need', 'news', 'next', 'nice',
  'nine', 'node', 'none', 'noon', 'norm', 'nose', 'note', 'noun', 'null', 'oath', 'odds', 'once',
  'only', 'onto', 'open', 'oral', 'over', 'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'palm',
  'park', 'part', 'pass', 'past', 'path', 'peak', 'pick', 'pile', 'pink', 'pipe', 'plan', 'play',
  'plot', 'plug', 'plus', 'poem', 'poet', 'poll', 'pool', 'poor', 'port', 'post', 'pull', 'pure',
  'push', 'quit', 'race', 'rail', 'rain', 'rank', 'rare', 'rate', 'read', 'real', 'rear', 'rely',
  'rent', 'rest', 'rich', 'ride', 'ring', 'rise', 'risk', 'road', 'rock', 'role', 'roll', 'roof',
  'room', 'root', 'rope', 'rose', 'rule', 'rush', 'safe', 'said', 'sail', 'sake', 'sale', 'salt',
  'same', 'sand', 'save', 'seal', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'send',
  'sent', 'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sign', 'sing', 'sink', 'site',
  'size', 'skin', 'slip', 'slow', 'snap', 'snow', 'soap', 'soft', 'soil', 'sold', 'sole', 'some',
  'song', 'soon', 'sort', 'soul', 'soup', 'spot', 'star', 'stay', 'step', 'stop', 'such', 'suit',
  'sure', 'take', 'tale', 'talk', 'tall', 'tank', 'tape', 'task', 'team', 'tell', 'tend', 'term',
  'test', 'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this', 'thus', 'tide', 'tied',
  'ties', 'time', 'tiny', 'tips', 'tire', 'told', 'tone', 'took', 'tool', 'tops', 'torn', 'tour',
  'town', 'tree', 'trip', 'true', 'tune', 'turn', 'twin', 'type', 'unit', 'upon', 'used', 'user',
  'uses', 'vary', 'vast', 'very', 'vice', 'view', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall',
  'want', 'ward', 'warm', 'warn', 'wash', 'wave', 'ways', 'weak', 'wear', 'week', 'well', 'went',
  'were', 'west', 'what', 'when', 'whom', 'wide', 'wife', 'wild', 'will', 'wind', 'wine', 'wing',
  'wire', 'wise', 'wish', 'with', 'wood', 'word', 'wore', 'work', 'yard', 'yeah', 'year', 'your',
  'zero', 'zone'
];