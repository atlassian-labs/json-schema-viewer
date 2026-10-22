import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SchemaApp } from './SchemaApp'
import { getBasename } from './basename'

export const App: React.FC = () => (
   <BrowserRouter basename={getBasename() !== "" ? getBasename() : undefined}>
      <SchemaApp />
   </BrowserRouter>
)