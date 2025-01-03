import * as tf from '@tensorflow/tfjs'
import * as bodyPix from '@tensorflow-models/body-pix'

export type ProcessingQuality = 'low' | 'medium' | 'high'

export class ImageProcessor {
  private static instance: ImageProcessor
  private model: bodyPix.BodyPix | null = null
  private modelLoading: Promise<void> | null = null

  private constructor() {}

  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor()
    }
    return ImageProcessor.instance
  }

  private async loadModel() {
    if (this.model) return
    if (this.modelLoading) {
      await this.modelLoading
      return
    }

    this.modelLoading = (async () => {
      await tf.ready()
      this.model = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      })
    })()

    await this.modelLoading
    this.modelLoading = null
  }

  async removeBackground(
    imageElement: HTMLImageElement,
    quality: ProcessingQuality = 'medium'
  ): Promise<ImageData> {
    await this.loadModel()
    if (!this.model) throw new Error('Model not loaded')

    const segmentation = await this.model.segmentPerson(imageElement, {
      flipHorizontal: false,
      internalResolution: quality === 'high' ? 'high' : quality === 'medium' ? 'medium' : 'low',
      segmentationThreshold: quality === 'high' ? 0.7 : quality === 'medium' ? 0.6 : 0.5
    })

    const canvas = document.createElement('canvas')
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Draw original image
    ctx.drawImage(imageElement, 0, 0)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Apply segmentation mask
    for (let i = 0; i < pixels.length; i += 4) {
      const segmentationIndex = Math.floor(i / 4)
      if (!segmentation.data[segmentationIndex]) {
        pixels[i + 3] = 0 // Set alpha to 0 for background
      }
    }

    return imageData
  }

  async processImageBehindText(
    originalImage: HTMLImageElement,
    text: string,
    textStyle: any,
    quality: ProcessingQuality = 'medium'
  ): Promise<Blob> {
    // Create canvas for final composition
    const canvas = document.createElement('canvas')
    canvas.width = originalImage.width
    canvas.height = originalImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Layer 1: Original image
    ctx.drawImage(originalImage, 0, 0)

    // Layer 2: Text
    ctx.save()
    Object.assign(ctx, textStyle)
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    ctx.restore()

    // Layer 3: Background-removed image
    const foregroundData = await this.removeBackground(originalImage, quality)
    ctx.putImageData(foregroundData, 0, 0)

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not create blob'))
      }, 'image/png')
    })
  }
}
