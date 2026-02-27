import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SpellingQuiz from './SpellingQuiz';

describe('SpellingQuiz Component', () => {
  const mockWordItem = {
    id: 1,
    word: 'apple',
    meaning: '사과',
    imageUrl: 'https://example.com/apple.jpg',
  };

  const mockOnAnswer = vi.fn();

  it('renders correctly and has autoCapitalize="none" on inputs', () => {
    render(<SpellingQuiz wordItem={mockWordItem} onAnswer={mockOnAnswer} />);

    // In SpellingQuiz, some characters are hidden.
    // For 'apple', it might hide some characters.
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    for (const input of inputs) {
      expect(input).toHaveAttribute('autoCapitalize', 'none');
      expect(input).toHaveAttribute('autoComplete', 'off');
      expect(input).toHaveAttribute('autoCorrect', 'off');
      expect(input).toHaveAttribute('spellCheck', 'false');
    }
  });

  it('displays the meaning of the word', () => {
    render(<SpellingQuiz wordItem={mockWordItem} onAnswer={mockOnAnswer} />);
    expect(screen.getByText(mockWordItem.meaning)).toBeInTheDocument();
  });

  it('shows the image', () => {
    render(<SpellingQuiz wordItem={mockWordItem} onAnswer={mockOnAnswer} />);
    const img = screen.getByAltText('Spelling target');
    expect(img).toHaveAttribute('src', mockWordItem.imageUrl);
  });
});
