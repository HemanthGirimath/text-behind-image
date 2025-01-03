import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image data provided or invalid format' },
        { status: 400 }
      )
    }

    // Create form data for remove.bg
    const removeFormData = new FormData()
    removeFormData.append('image_file', image, 'image.png')
    removeFormData.append('size', 'auto')

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY || '',
      },
      body: removeFormData,
    })

    if (!response.ok) {
      throw new Error(`Remove.bg API error: ${await response.text()}`)
    }

    const buffer = await response.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error('Remove.bg API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge';
