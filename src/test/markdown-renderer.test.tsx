import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Markdown } from '../markdown';

describe('markdown renderer', () => {
  test('safely displays HTML but protects against XSS', async () => {
    render(
      <Markdown
        source={`
# Hello world
<p title="para">This is some safe text!</p>
<img title="xssimg" src="test.png" onerror="alert('XSS');">
<script title="xss">alert("XSS")</script>
<style title="xsscss">* { display: none; }</style>
`}
      />
    );

    // It renders markdown
    expect(screen.getByText('Hello world')).toBeTruthy();
    // and paragraphs
    expect(screen.getByTitle('para')).toHaveTextContent('This is some safe text!');
    // but blocks attributes that can run code
    expect(screen.getByTitle('xssimg')).not.toHaveAttribute('onerror');
    // and blocks script and style tags outright
    expect(screen.queryByTitle('xss')).toBeNull();
    expect(screen.queryByTitle('xsscss')).toBeNull();
  });
})
