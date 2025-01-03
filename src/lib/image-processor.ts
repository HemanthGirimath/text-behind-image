import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

export type ProcessingQuality = 'low' | 'medium' | 'high'

export interface TextStyle {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  font: string;
  active: boolean;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: {
    x: number;
    y: number;
  };
  gradient: boolean;
  gradientColors: {
    start: string;
    middle: string;
    end: string;
  };
  rotation: number;
  scale: number;
  opacity: number;
  blur: number;
  transform: {
    skewX: number;
    skewY: number;
  };
}

export type LayeredImage = {
  background: string;
  foreground: string;
  width: number;
  height: number;
}

class ImageProcessor {
  private static instance: ImageProcessor
  private constructor() {}

  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor()
    }
    return ImageProcessor.instance
  }

  async processImage(file: File): Promise<LayeredImage> {
    const bgRemover = (await import('./background-remover')).default.getInstance();
    const { foreground, background } = await bgRemover.removeBackground(file);

    // Create URLs for the layers
    const foregroundUrl = URL.createObjectURL(foreground);
    const backgroundUrl = URL.createObjectURL(background);

    // Get image dimensions
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = backgroundUrl;
    });

    return {
      background: backgroundUrl,
      foreground: foregroundUrl,
      width: img.width,
      height: img.height
    };
  }

  async exportImage(
    layers: LayeredImage,
    textLayers: TextStyle[],
    width: number,
    height: number
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = width;
    canvas.height = height;

    // Draw background
    const bgImg = await this.loadImage(layers.background);
    ctx.drawImage(bgImg, 0, 0, width, height);

    // Draw text layers
    for (const textLayer of textLayers) {
      ctx.save();
      ctx.font = `${textLayer.size}px ${textLayer.font}`;
      ctx.fillStyle = textLayer.color;
      
      if (textLayer.gradient) {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, textLayer.gradientColors.start);
        gradient.addColorStop(0.5, textLayer.gradientColors.middle);
        gradient.addColorStop(1, textLayer.gradientColors.end);
        ctx.fillStyle = gradient;
      }

      if (textLayer.shadow) {
        ctx.shadowColor = textLayer.shadowColor;
        ctx.shadowBlur = textLayer.shadowBlur;
        ctx.shadowOffsetX = textLayer.shadowOffset.x;
        ctx.shadowOffsetY = textLayer.shadowOffset.y;
      }

      ctx.fillText(textLayer.text, textLayer.x, textLayer.y);
      ctx.restore();
    }

    // Draw foreground
    const fgImg = await this.loadImage(layers.foreground);
    ctx.drawImage(fgImg, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }
}

export default ImageProcessor
