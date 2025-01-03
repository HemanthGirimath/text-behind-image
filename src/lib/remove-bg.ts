export async function removeImageBackground(imageData: string): Promise<string> {
  try {
    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove background');
    }

    const data = await response.json();
    return data.foreground;
  } catch (error) {
    console.error('Error removing background:', error);
    throw new Error('Failed to process image with remove.bg. Please try again.');
  }
}
