import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './BrowserApp';
import './style.css';

/* global __webpack_nonce__ */ // eslint-disable-line no-unused-vars

// CSP: Set a special variable to add `nonce` attributes to all styles/script tags
// See https://github.com/webpack/webpack/pull/3210
// @ts-expect-error
__webpack_nonce__ = (window as any).NONCE_ID; // eslint-disable-line no-global-assign, camelcase

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Could not find the root element.');
}

createRoot(rootElement).render(React.createElement(App));
