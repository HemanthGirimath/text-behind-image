"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { ChevronDown, ChevronRight, Download, Loader2, RotateCcw, Upload, Wand2, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { removeImageBackground } from "@/lib/remove-bg"
import {nanoid} from 'nanoid'

interface TextStyle {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  rotation: number;
  scale: number;
  opacity: number;
  blur: number;
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
  active: boolean;
  transform: {
    skewX: number;
    skewY: number;
  };
}

interface ProcessedImage {
  result: string;  // The final processed image with text
}

interface LayeredImage {
  background: string;
  foreground: string;
  width: number;
  height: number;
  result: string;
}

interface EditorLayoutProps {}

const plans = [
  {
    name: 'Basic',
    features: [
      'Font color customization',
      'Font size adjustment',
      'Up to 10 font options',
      'Single text layer',
      'Font scale controls',
      'Basic text editing',
      'Export as PNG',
      'Gradient text effects',
      'Text shadow controls',
      'Font curving options',
      'Advanced text positioning',
    ],
  },
  {
    name: 'Premium',
    features: [
      'Everything in Basic, plus:',
      'Unlimited text layers',
      'Advanced image effects',
      'AI color suggestions',
      'AI text style suggestions',
      'Priority support',
      'Team collaboration features',
    ],
  },
]

const userPlan = 'premium'; // Replace with actual user plan

const defaultGradientColors = {
  start: '#ff0000',
  middle: '#00ff00',
  end: '#0000ff'
};

const defaultShadowSettings = {
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffset: { x: 2, y: 2 }
};

const defaultTextStyle: TextStyle = {
  id: '',
  text: 'New Text',
  x: 50,
  y: 50,
  size: 24,
  color: '#ffffff',
  font: 'Arial',
  rotation: 0,
  scale: 1,
  opacity: 1,
  blur: 0,
  shadow: false,
  shadowColor: '#000000',
  shadowBlur: 5,
  shadowOffset: {
    x: 2,
    y: 2
  },
  gradient: false,
  gradientColors: {
    start: '#ff0000',
    middle: '#00ff00',
    end: '#0000ff'
  },
  transform: {
    skewX: 0,
    skewY: 0
  },
  active: false
}

/**
 * EditorLayout is a React component for an image and text editing interface.
 * It manages state for image uploads, text layers, and editing features such as
 * text positioning, scaling, rotation, opacity, and more. Users can upload images,
 * add text layers, and customize them with features organized into collapsible sections.
 * The component also handles image processing and exporting with the applied text layers.
 */
export default function EditorLayout({}: EditorLayoutProps) {
  // State initialization with proper hydration handling
  const [mounted, setMounted] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [currentView, setCurrentView] = useState<'original' | 'processed'>('original')
  const [textLayers, setTextLayers] = useState<TextStyle[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png');
  const [outputQuality, setOutputQuality] = useState(90);
  
  // Collapsible states
  const [freeOpen, setFreeOpen] = useState(true)
  const [basicOpen, setBasicOpen] = useState(false)
  const [premiumOpen, setPremiumOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const updateTextLayer = (layerId: string, changes: Partial<TextStyle>) => {
    setTextLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, ...changes } : layer
      )
    )
  }

  const handleTextChange = (layerId: string, text: string) => {
    setTextLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, text } : layer
      )
    )
  }

  const addNewLayer = () => {
    if (!uploadedImage) return;
    
    const newLayer: TextStyle = {
      id: nanoid(),
      text: 'New Text',
      x: 50,
      y: 50,
      size: 24,
      color: '#000000',
      font: 'Arial',
      rotation: 0,
      scale: 1,
      opacity: 1,
      blur: 0,
      shadow: false,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffset: { x: 0, y: 0 },
      gradient: false,
      gradientColors: {
        start: '#ff0000',
        middle: '#00ff00',
        end: '#0000ff'
      },
      active: false,
      transform: {
        skewX: 0,
        skewY: 0
      }
    };
    
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const handleDeleteLayer = (layerId: string) => {
    setTextLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId))
    if (selectedLayer === layerId) {
      setSelectedLayer(null)
    }
  }

  const handleTextDragStart = (e: React.MouseEvent | React.TouchEvent, layerId: string) => {
    e.preventDefault();
    setSelectedLayer(layerId);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragStartPos({ x: clientX, y: clientY });
  };

  const handleTextDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedLayer || !dragStartPos || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;

    setTextLayers(prev => prev.map(layer => {
      if (layer.id === selectedLayer) {
        const newX = ((layer.x / 100) * rect.width + deltaX) / rect.width * 100;
        const newY = ((layer.y / 100) * rect.height + deltaY) / rect.height * 100;
        return { ...layer, x: newX, y: newY };
      }
      return layer;
    }));

    setDragStartPos({ x: clientX, y: clientY });
  }, [isDragging, selectedLayer, dragStartPos]);

  const handleTextDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartPos(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTextDragMove);
      window.addEventListener('mouseup', handleTextDragEnd);
      window.addEventListener('touchmove', handleTextDragMove);
      window.addEventListener('touchend', handleTextDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleTextDragMove);
      window.removeEventListener('mouseup', handleTextDragEnd);
      window.removeEventListener('touchmove', handleTextDragMove);
      window.removeEventListener('touchend', handleTextDragEnd);
    };
  }, [isDragging, handleTextDragMove, handleTextDragEnd]);

  const handleReset = () => {
    setProcessedImage(null);
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      link.href = processedImage.result;
      link.download = `processed-image.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleProcessImage = async () => {
    if (!uploadedImage || !textLayers.length) return;
    setIsProcessing(true);
    const toastId = toast.loading('Processing image...');

    try {
      // Get foreground image from remove.bg
      const foregroundImage = await removeImageBackground(uploadedImage);
      
      // Load images
      const [bgImg, fgImg] = await Promise.all([
        loadImage(uploadedImage),
        loadImage(foregroundImage)
      ]);

      // Create canvas with original image dimensions
      const canvas = document.createElement('canvas');
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw background maintaining aspect ratio
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height);

      // Draw text layers
      textLayers.forEach(layer => {
        ctx.save();
        
        // Calculate position based on original image dimensions
        const x = (layer.x / 100) * bgImg.width;
        const y = (layer.y / 100) * bgImg.height;
        
        // Apply transformations
        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        
        // Set text styles
        ctx.font = `${layer.size}px ${layer.font || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.opacity;

        if (layer.shadow) {
          ctx.shadowColor = layer.shadowColor;
          ctx.shadowBlur = layer.shadowBlur;
          ctx.shadowOffsetX = layer.shadowOffset.x;
          ctx.shadowOffsetY = layer.shadowOffset.y;
        }

        if (layer.gradient) {
          const gradient = ctx.createLinearGradient(-50, -50, 50, 50);
          gradient.addColorStop(0, layer.gradientColors.start);
          gradient.addColorStop(0.5, layer.gradientColors.middle);
          gradient.addColorStop(1, layer.gradientColors.end);
          ctx.fillStyle = gradient;
        }
        
        // Draw text
        ctx.fillText(layer.text, 0, 0);
        ctx.restore();
      });

      // Draw foreground maintaining aspect ratio
      ctx.drawImage(fgImg, 0, 0, bgImg.width, bgImg.height);

      // Get final image
      const finalImage = canvas.toDataURL(outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png', outputQuality / 100);

      // Set processed result
      setProcessedImage({ result: finalImage });
      toast.success('Image processed successfully!', { id: toastId });
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleGradientColorChange = (
    layerId: string,
    position: 'start' | 'middle' | 'end',
    color: string
  ) => {
    setTextLayers(layers =>
      layers.map(layer => {
        if (layer.id === layerId) {
          return {
            ...layer,
            gradientColors: {
              ...layer.gradientColors,
              [position]: color || (position === 'start' ? '#ff0000' : position === 'middle' ? '#00ff00' : '#0000ff')
            }
          };
        }
        return layer;
      })
    );
  };

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    // Load saved data after mounting
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('uploadedImage')
      const savedProcessedImage = localStorage.getItem('processedImage')
      const savedTextLayers = localStorage.getItem('textLayers')
      
      if (savedImage) {
        setUploadedImage(savedImage)
      }
      
      if (savedProcessedImage) {
        setProcessedImage(JSON.parse(savedProcessedImage))
      }
      
      if (savedTextLayers) {
        setTextLayers(JSON.parse(savedTextLayers))
      }
    }
  }, [])

  // Don't render anything until after hydration
  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Image Editor</h2>
      </div>
      
      <div className="flex gap-4">
        {/* Left side - Image Preview */}
        <div className="flex-1">
          {/* Image Container - Always fixed size */}
          <div 
            ref={containerRef}
            className="relative w-[1024px] h-[768px] bg-gray-100 rounded-lg overflow-hidden mb-4"
          >
            {uploadedImage ? (
              <>
                <div className="relative w-full h-full">
                  {processedImage ? (
                    <img
                      src={processedImage.result}
                      alt="Processed"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <img
                        src={uploadedImage}
                        alt="Background"
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Text Layers - only show when not processed */}
                      {textLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className={`absolute ${selectedLayer === layer.id ? 'cursor-move' : 'cursor-pointer'}`}
                          style={{
                            left: `${layer.x}%`,
                            top: `${layer.y}%`,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                            fontSize: `${layer.size}px`,
                            opacity: layer.opacity,
                            filter: `blur(${layer.blur}px)`,
                            textShadow: layer.shadow
                              ? `${layer.shadowOffset.x}px ${layer.shadowOffset.y}px ${layer.shadowBlur}px ${layer.shadowColor}`
                              : 'none',
                            fontFamily: layer.font,
                            zIndex: selectedLayer === layer.id ? 2 : 1,
                            display: 'inline-block',
                            ...(layer.gradient
                              ? {
                                  backgroundImage: `linear-gradient(45deg, ${layer.gradientColors.start}, ${layer.gradientColors.middle}, ${layer.gradientColors.end})`,
                                  WebkitBackgroundClip: 'text',
                                  backgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  color: 'transparent',
                                  backgroundColor: 'transparent'
                                }
                              : {
                                  color: layer.color
                                })
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLayer(layer.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleTextDragStart(e, layer.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            handleTextDragStart(e, layer.id);
                          }}
                        >
                          {layer.text}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {processedImage ? (
                    <button
                      onClick={handleReset}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setTextLayers([]);
                        setSelectedLayer(null);
                      }}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div {...getRootProps()} className="w-full h-full flex items-center justify-center">
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Drag & drop an image here, or click to select</p>
                </div>
              </div>
            )}
          </div>

          {/* Process Controls */}
          {uploadedImage && (
            <div className="w-full max-w-[1024px] space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <Select
                  value={outputFormat}
                  onValueChange={(value: 'png' | 'jpeg') => setOutputFormat(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
                
                {outputFormat === 'jpeg' && (
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Label>Quality</Label>
                      <span className="text-sm text-gray-500">{outputQuality}%</span>
                    </div>
                    <Slider
                      value={[outputQuality]}
                      onValueChange={(value) => setOutputQuality(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {processedImage ? (
                <Button 
                  className="w-fit mx-auto px-4" 
                  size="default"
                  disabled={isDownloading}
                  onClick={handleDownload}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  className="w-fit mx-auto px-4" 
                  size="default"
                  disabled={isProcessing || textLayers.length === 0}
                  onClick={handleProcessImage}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Image...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Process Image
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Text Controls */}
        <Card className="w-[300px] h-[768px] overflow-y-auto p-4">
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={addNewLayer} 
              disabled={!uploadedImage}
            >
              Add Text Layer
            </Button>

            {selectedLayer && (
              <div className="space-y-4">
                {/* Free Features */}
                <Collapsible open={freeOpen} onOpenChange={setFreeOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <h4 className="text-sm font-medium">Free Features</h4>
                    <div>
                      {freeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label>Text</Label>
                      <Input
                        value={textLayers.find(l => l.id === selectedLayer)?.text || ''}
                        onChange={(e) => handleTextChange(selectedLayer, e.target.value)}
                        placeholder="Enter text"
                      />
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="12"
                          max="96"
                          value={textLayers.find(l => l.id === selectedLayer)?.size || 24}
                          onChange={(e) => updateTextLayer(selectedLayer, { size: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.size || 24}px
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayer)?.color || '#000000'}
                        onChange={(e) => updateTextLayer(selectedLayer, { color: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Basic Features */}
                <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <h4 className="text-sm font-medium">Basic Features</h4>
                    <div>
                      {basicOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label>Rotation</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={textLayers.find(l => l.id === selectedLayer)?.rotation || 0}
                          onChange={(e) => updateTextLayer(selectedLayer, { rotation: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.rotation || 0}°
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Scale</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={textLayers.find(l => l.id === selectedLayer)?.scale || 1}
                          onChange={(e) => updateTextLayer(selectedLayer, { scale: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.scale || 1}x
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Opacity</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={textLayers.find(l => l.id === selectedLayer)?.opacity || 1}
                          onChange={(e) => updateTextLayer(selectedLayer, { opacity: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {Math.round((textLayers.find(l => l.id === selectedLayer)?.opacity || 1) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Premium Features */}
                <Collapsible open={premiumOpen} onOpenChange={setPremiumOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <h4 className="text-sm font-medium">Premium Features</h4>
                    <div>
                      {premiumOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label>Shadow</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={textLayers.find(l => l.id === selectedLayer)?.shadow || false}
                          onChange={(e) => updateTextLayer(selectedLayer, { shadow: e.target.checked })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Shadow Color</Label>
                      <Input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayer)?.shadowColor || '#000000'}
                        onChange={(e) => updateTextLayer(selectedLayer, { shadowColor: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Shadow Blur</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={textLayers.find(l => l.id === selectedLayer)?.shadowBlur || 5}
                          onChange={(e) => updateTextLayer(selectedLayer, { shadowBlur: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.shadowBlur || 5}px
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Shadow Offset X</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          value={textLayers.find(l => l.id === selectedLayer)?.shadowOffset.x || 2}
                          onChange={(e) => updateTextLayer(selectedLayer, { shadowOffset: { x: parseInt(e.target.value), y: textLayers.find(l => l.id === selectedLayer)?.shadowOffset.y || 2 } })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.shadowOffset.x || 2}px
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Shadow Offset Y</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          value={textLayers.find(l => l.id === selectedLayer)?.shadowOffset.y || 2}
                          onChange={(e) => updateTextLayer(selectedLayer, { shadowOffset: { x: textLayers.find(l => l.id === selectedLayer)?.shadowOffset.x || 2, y: parseInt(e.target.value) } })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {textLayers.find(l => l.id === selectedLayer)?.shadowOffset.y || 2}px
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Gradient</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={textLayers.find(l => l.id === selectedLayer)?.gradient || false}
                          onChange={(e) => updateTextLayer(selectedLayer, { gradient: e.target.checked })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Gradient Start Color</Label>
                      <Input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayer)?.gradientColors.start || '#ff0000'}
                        onChange={(e) => handleGradientColorChange(selectedLayer, 'start', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Gradient Middle Color</Label>
                      <Input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayer)?.gradientColors.middle || '#00ff00'}
                        onChange={(e) => handleGradientColorChange(selectedLayer, 'middle', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Gradient End Color</Label>
                      <Input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayer)?.gradientColors.end || '#0000ff'}
                        onChange={(e) => handleGradientColorChange(selectedLayer, 'end', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedLayer) {
                      setTextLayers(textLayers.filter(l => l.id !== selectedLayer));
                      setSelectedLayer(null);
                    }
                  }}
                >
                  Delete Layer
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
