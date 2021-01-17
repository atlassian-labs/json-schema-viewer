import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SchemaApp } from './SchemaApp'

export const App: React.FC = () => (
   <BrowserRouter>
      <SchemaApp />
   </BrowserRouter>
)