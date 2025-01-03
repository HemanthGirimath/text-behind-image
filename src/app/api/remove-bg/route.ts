import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('image_file_b64', image.split(',')[1]);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return NextResponse.json({
      foreground: `data:image/png;base64,${base64}`
    });
  } catch (error) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
