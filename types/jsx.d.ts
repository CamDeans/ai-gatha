/**
 * Global JSX type declarations
 * Extends React's JSX namespace with custom element types
 */
/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {} 