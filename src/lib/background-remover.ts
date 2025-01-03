export class BackgroundRemover {
  private static instance: BackgroundRemover;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '';
  }

  static getInstance(): BackgroundRemover {
    if (!BackgroundRemover.instance) {
      BackgroundRemover.instance = new BackgroundRemover();
    }
    return BackgroundRemover.instance;
  }

  async removeBackground(imageFile: File): Promise<{ foreground: Blob, background: Blob }> {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to remove background');
    }

    // Get the transparent PNG
    const foregroundBlob = await response.blob();
    
    // Keep the original as background
    const background = new Blob([imageFile], { type: imageFile.type });

    return {
      foreground: foregroundBlob,
      background: background
    };
  }
}

export default BackgroundRemover;
