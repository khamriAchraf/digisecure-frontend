declare module '*.json' {
  const value: any;
  export default value;
}

declare module '../../messages/en.json' {
  const messages: Record<string, any>;
  export default messages;
}

declare module '../../messages/fr.json' {
  const messages: Record<string, any>;
  export default messages;
} 