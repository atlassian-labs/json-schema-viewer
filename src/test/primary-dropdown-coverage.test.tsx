import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

let mockIsVisible = true;
const mockCloseOverflowMenu = jest.fn();

jest.mock('@atlaskit/atlassian-navigation', () => ({
  useOverflowStatus: () => ({
    isVisible: mockIsVisible,
    closeOverflowMenu: mockCloseOverflowMenu,
  }),
  PrimaryDropdownButton: (props: any) => (
    <button data-testid={props.testId} onClick={props.onClick} onKeyDown={props.onKeyDown}>
      {props.children}
    </button>
  ),
}));

jest.mock('@atlaskit/menu', () => ({
  ButtonItem: (props: any) => (
    <button data-testid={props.testId} onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));

jest.mock('@atlaskit/popup', () => {
  const Popup = (props: any) => (
    <>
      {props.trigger({})}
      {props.isOpen && (
        <div data-testid="popup-content">
          {props.content({})}
          <button onClick={props.onClose}>Dismiss popup</button>
        </div>
      )}
    </>
  );

  return { __esModule: true, default: Popup };
});

import { PrimaryDropdown } from '../PrimaryDropdown';

describe('PrimaryDropdown', () => {
  beforeEach(() => {
    mockIsVisible = true;
    mockCloseOverflowMenu.mockClear();
  });

  test('renders the overflow-menu item and closes the overflow menu when clicked', () => {
    mockIsVisible = false;

    render(<PrimaryDropdown text="Examples" content={() => <span>Examples content</span>} />);

    fireEvent.click(screen.getByTestId('Examples'));

    expect(mockCloseOverflowMenu).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Examples')).toBeInTheDocument();
  });

  test('opens from click or ArrowDown, passes highlight state, and closes', () => {
    render(
      <PrimaryDropdown
        text="Help"
        isHighlighted={true}
        content={({ closePopup }) => <button onClick={closePopup}>Close from content</button>}
      />
    );

    const trigger = screen.getByTestId('Help-popup-trigger');
    expect(trigger).not.toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByTestId('popup-content')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close from content'));
    expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByTestId('popup-content')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dismiss popup'));
    expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
  });
});
