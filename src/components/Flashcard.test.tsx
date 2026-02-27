import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Flashcard from './Flashcard';

describe('Flashcard Component', () => {
  const mockWordItem = {
    id: 1,
    word: 'Apple',
    meaning: '사과',
    imageUrl: 'https://example.com/apple.jpg',
  };

  it('renders the front of the card initially', () => {
    render(<Flashcard wordItem={mockWordItem} />);

    // Front side should show the image and "클릭해서 뒤집기" text
    expect(screen.getByAltText('word illustration')).toHaveAttribute(
      'src',
      mockWordItem.imageUrl,
    );
    expect(screen.getByText(/클릭해서 뒤집기/i)).toBeInTheDocument();
  });

  it('flips to the back when clicked', async () => {
    render(<Flashcard wordItem={mockWordItem} />);

    const card =
      screen.getByText(/클릭해서 뒤집기/i).parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    // Back side should show the word and meaning
    expect(screen.getByText(mockWordItem.word)).toBeInTheDocument();
    expect(screen.getByText(mockWordItem.meaning)).toBeInTheDocument();
  });

  it('plays audio when flipped to the back', () => {
    const speakMock = vi.spyOn(window.speechSynthesis, 'speak');
    render(<Flashcard wordItem={mockWordItem} />);

    const card =
      screen.getByText(/클릭해서 뒤집기/i).parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    expect(speakMock).toHaveBeenCalled();
  });

  it('plays audio when the speaker button is clicked on the back side', () => {
    const speakMock = vi.spyOn(window.speechSynthesis, 'speak');
    render(<Flashcard wordItem={mockWordItem} />);

    // Flip first
    const card =
      screen.getByText(/클릭해서 뒤집기/i).parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    // Now back side is visible, click speaker
    const speakerButton = screen.getByLabelText('발음 듣기');
    fireEvent.click(speakerButton);

    expect(speakMock).toHaveBeenCalledTimes(2); // One from flip, one from button click
  });

  it('uses the provided speechRate when speaking', () => {
    const speakMock = vi.spyOn(window.speechSynthesis, 'speak');
    const customRate = 1.2;

    render(<Flashcard wordItem={mockWordItem} speechRate={customRate} />);

    // Trigger flip to auto-play
    const card =
      screen.getByText(/클릭해서 뒤집기/i).parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    expect(speakMock).toHaveBeenCalled();
    const utterance = (speakMock.mock.calls[0][0] as SpeechSynthesisUtterance);
    expect(utterance.rate).toBe(customRate);
  });
});
