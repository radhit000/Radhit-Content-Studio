import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FeatureItem, ProcessedImage, AspectRatio, AppSettings } from '../types';
import { ImageUploader } from './ImageUploader';
import { ComparisonView } from './ComparisonView';
import { Controls } from './Controls';
import { generateCompositeImage, editImageWithGemini } from '../services/geminiService';

interface WorkspaceProps {
  selectedFeature: FeatureItem | null;
  originalImage: string | null;
  results: ProcessedImage[];
  isProcessing: boolean;
  onImageSelected: (base64: string, mimeType: string) => void;
  onGenerate: (prompt: string, aspectRatio?: string) => void;
  onSelectResult: (result: ProcessedImage) => void;
  onReset: () => void;
  activeResultId: string | null;
  userApiKey?: string;
  appSettings: AppSettings;
}

// Features that should generate 4 variations (Grid View)
const VARIATION_IDS = [
  'restore', 'miniature', 'artist', 'product', 'fashion', 'mockup', 'banner',
  'pov', 'prewed', 'fitting', 'model', 'baby', 'kids', 'haji', 'pasfoto',
  'maternity', 'home', 'sketch', 'art', 'logo', 'mascot', 'retouch', 'barber', 'tidy'
];

export const Workspace: React.FC<WorkspaceProps> = ({
  selectedFeature,
  originalImage,
  results,
  isProcessing,
  onImageSelected,
  onGenerate: parentOnGenerate,
  onSelectResult,
  onReset,
  activeResultId,
  userApiKey,
  appSettings
}) => {
  const [uploadedImages, setUploadedImages] = useState<{base64: string, mimeType: string}[]>([]);
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  // Feature specific states
  const [useModel, setUseModel] = useState(false); // For Product Photo
  
  // Mascot Feature States
  const [mascotType, setMascotType] = useState('Kartun');
  const [brandColor, setBrandColor] = useState('');

  // Banner Feature State
  const [bannerTexts, setBannerTexts] = useState({ main: '', support: '', footer: '' });
  const [bannerStyle, setBannerStyle] = useState('simple'); // simple, background, pro
  const [showCTA, setShowCTA] = useState(false);
  const [ctaText, setCtaText] = useState('');

  // Prewed Feature State
  const [weddingType, setWeddingType] = useState('Pre-wedding'); // Pre-wedding or Wedding

  // Pas Foto Feature State
  const [pasFotoColor, setPasFotoColor] = useState('Merah');
  const [pasFotoAttire, setPasFotoAttire] = useState('Kemeja Putih');

  // Expand Feature State
  const [expandSettings, setExpandSettings] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [imgDimensions, setImgDimensions] = useState<{w: number, h: number} | null>(null);

  // Edit (Inpainting) Feature State
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Results for grid view
  const [localCompositeResults, setLocalCompositeResults] = useState<ProcessedImage[]>([]);

  useEffect(() => {
    if (selectedFeature?.allowMultiUpload) {
      setUploadedImages([]);
    }
    // Reset states
    setUseModel(false);
    setMascotType('Kartun');
    setBrandColor('');
    setBannerTexts({ main: '', support: '', footer: '' });
    setBannerStyle('simple');
    setShowCTA(false);
    setCtaText('');
    setWeddingType('Pre-wedding');
    setPasFotoColor('Merah');
    setPasFotoAttire('Kemeja Putih');
    setExpandSettings({ top: 0, right: 0, bottom: 0, left: 0 });
    clearCanvas();
    setLocalCompositeResults([]);
  }, [selectedFeature]);

  // Load image dimensions when originalImage changes
  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.src = originalImage;
      img.onload = () => {
        setImgDimensions({ w: img.width, h: img.height });
        // Resize canvas to match image intrinsic size if in edit mode
        if (selectedFeature?.id === 'edit' && canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
        }
      };
    } else {
      setImgDimensions(null);
    }
  }, [originalImage, selectedFeature]);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleMultiImageUpload = (base64: string, mimeType: string) => {
    if (uploadedImages.length >= 5) return;
    setUploadedImages(prev => [...prev, { base64, mimeType }]);
  };

  const handleSpecificImageUpload = (index: number, base64: string, mimeType: string) => {
    setUploadedImages(prev => {
      const next = [...prev];
      // Fill gaps with empty objects if necessary
      for (let i = 0; i <= index; i++) {
        if (!next[i]) next[i] = { base64: '', mimeType: '' };
      }
      next[index] = { base64, mimeType };
      return next;
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- DRAWING LOGIC (EDIT MODE) ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)'; // Teal-500 50%
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  // --- UNIFIED VARIATION GENERATOR (GRID 2x2) ---
  const handleUnifiedVariations = async (userPrompt: string, aspectRatio?: AspectRatio) => {
    setInternalProcessing(true);
    setLocalCompositeResults([]); // Clear previous results
    
    // Determine Feature Context
    const featureId = selectedFeature?.id || '';
    
    // Determine Input Image Source
    // Some features use uploadedImages (Product, Prewed), others use originalImage (Restore, Kids, etc)
    const isMultiInputFeature = selectedFeature?.allowMultiUpload;
    let base64Input: string | null = null;
    let mimeInput = 'image/png';
    let compositeInputs: { base64: string; mimeType: string }[] = [];

    if (isMultiInputFeature) {
        if (uploadedImages.length > 0) {
            // For single-image logic using multi-uploader (like Product single)
            base64Input = uploadedImages[0].base64;
            mimeInput = uploadedImages[0].mimeType;
            compositeInputs = uploadedImages;
        }
    } else {
        if (originalImage) {
            base64Input = originalImage.split(',')[1];
            // simplified mime extraction if needed, usually passed down, but here we assume png/jpeg from split
            mimeInput = originalImage.match(/data:(.*);base64/)?.[1] || 'image/png';
        }
    }

    // Validation
    if (featureId === 'product' && useModel && uploadedImages.length < 2) {
       alert("Mode 'Dengan Model' memerlukan 2 foto.");
       setInternalProcessing(false);
       return;
    }
    if (featureId === 'prewed' && (!uploadedImages[0]?.base64 || !uploadedImages[1]?.base64)) {
       alert("Mode Pre-wedding memerlukan foto Pria dan Wanita.");
       setInternalProcessing(false);
       return;
    }
    // Allow null input for features like Mascot/Logo/Banner if they can generate from text
    
    // Dynamic loop count based on feature
    const loopCount = (featureId === 'prewed' || featureId === 'product' || featureId === 'pasfoto' || featureId === 'mascot' || featureId === 'banner') ? 4 : 2;
    let completedCount = 0;
    const errors: string[] = [];
    
    const generateVariation = async (i: number) => {
        try {
            let finalPrompt = userPrompt;
            let systemPrompt = selectedFeature?.systemPrompt || '';

            // --- FEATURE SPECIFIC PROMPT LOGIC ---
            
            if (featureId === 'mascot') {
                 finalPrompt = `
                    [VARIATION ${i+1}]
                    [USER PROMPT]: ${userPrompt}
                    [MASCOT TYPE]: ${mascotType}
                    [BRAND COLOR]: ${brandColor || "Not Specified"}
                    [INSTRUCTION]: Create a mascot of type '${mascotType}'. Use '${brandColor}' as the primary brand color.
                    Make this variation unique in pose or expression.
                 `.trim();
            } 
            else if (featureId === 'banner') {
                let styleInstructions = "";
                if (bannerStyle === 'simple') styleInstructions = "STYLE: Clean, Minimalist.";
                else if (bannerStyle === 'background') styleInstructions = "STYLE: Rich Thematic Background.";
                else if (bannerStyle === 'pro') styleInstructions = "STYLE: High-End Professional Poster with Effects.";

                const ctaInstruction = showCTA ? `CTA BUTTON: "${ctaText}"` : "NO CTA.";
                
                finalPrompt = `
                    [VARIATION ${i+1}]
                    ${styleInstructions}
                    HEADLINE: "${bannerTexts.main}"
                    SUBTEXT: "${bannerTexts.support}"
                    FOOTER: "${bannerTexts.footer}"
                    ${ctaInstruction}
                    THEME: ${userPrompt}
                    Make this design unique compared to others.
                `.trim();
            }
            else if (featureId === 'prewed') {
                const variations = [
                    { angle: "Wide Angle Landscape", style: "Cinematic Epic" },
                    { angle: "Close-up Portrait", style: "Intimate Romantic" },
                    { angle: "Full Body Interaction", style: "Candid & Natural" },
                    { angle: "Artistic Silhouette", style: "Dreamy & Ethereal" }
                ];
                const currentVar = variations[i % variations.length];
                const modeText = weddingType === 'Wedding' ? "Wedding Ceremony (Formal Attire)" : "Pre-wedding Session (Casual/Thematic)";
                
                finalPrompt = `
                    [VARIATION ${i+1}]
                    [MODE]: ${modeText}
                    [STYLE]: ${currentVar.style}
                    [ANGLE]: ${currentVar.angle}
                    [SUBJECTS]: Image 1 is GROOM (Male), Image 2 is BRIDE (Female).
                    [SCENARIO]: ${userPrompt}
                    [STRICT INSTRUCTION: FACE DNA PRESERVATION]: 
                    - Analyze and lock the Face DNA of both subjects.
                    - Preserve facial features, bone structure, and identity 100% accurately.
                    - Only modify clothing, background, and pose to fit the ${modeText} theme.
                    - Ensure professional studio lighting and high-end photography quality.
                `.trim();
            }
            else if (featureId === 'product') {
                if (useModel) {
                     systemPrompt += " [IMPORTANT: Image 1 is PRODUCT, Image 2 is MODEL. Model must hold/use product.]";
                }
                finalPrompt = `${userPrompt} \n\n[VARIATION ${i+1}]: Use a unique angle, lighting setup, or background composition for this shot.`;
            }
            else if (featureId === 'pasfoto') {
                // Pas foto usually needs consistency, but we can vary slightly to give options
                finalPrompt = `
                    [VARIATION ${i+1}]
                    [BACKGROUND COLOR]: ${pasFotoColor}
                    [ATTIRE]: ${pasFotoAttire}
                    [STRICT INSTRUCTION: FACE DNA PRESERVATION]: 
                    - Lock the subject's Face DNA.
                    - Preserve facial features, bone structure, and identity 100% accurately.
                    - Create a formal ID photo (Pas Foto). 
                    - The background MUST be solid ${pasFotoColor}. 
                    - The subject MUST wear ${pasFotoAttire}.
                    - Ensure perfect formal posture and studio lighting.
                    ${userPrompt ? `[ADDITIONAL]: ${userPrompt}` : ''}
                `.trim();
            }
            else {
                // General Features (Restore, Kids, Artist, etc)
                finalPrompt = `
                    ${userPrompt} 
                    [STRICT INSTRUCTION: FACE DNA PRESERVATION]: 
                    - Lock and preserve the subject's Face DNA.
                    - Maintain 100% facial accuracy and identity.
                    - [VARIATION ${i+1}]: Make this result distinct (lighting/angle/style) while adhering to the main task.
                `.trim();
            }


            // --- API CALL ---
            let resultBase64 = "";

            // Use Composite if: Product+Model, Prewed, or generally multiple images
            if ((featureId === 'product' && useModel) || featureId === 'prewed') {
                 resultBase64 = await generateCompositeImage(
                    compositeInputs,
                    finalPrompt,
                    aspectRatio || '1:1',
                    systemPrompt,
                    userApiKey
                 );
            } else {
                 // Single Image or Text-Only
                 resultBase64 = await editImageWithGemini(
                    base64Input, // Can be null for Text-to-Image (Mascot/Logo)
                    mimeInput,
                    finalPrompt,
                    systemPrompt,
                    aspectRatio || '1:1',
                    userApiKey
                 );
            }

            const newResult: ProcessedImage = {
                id: Date.now().toString() + i,
                original: originalImage || (compositeInputs.length > 0 ? `data:${compositeInputs[0].mimeType};base64,${compositeInputs[0].base64}` : `data:image/png;base64,${resultBase64}`),
                result: resultBase64,
                prompt: finalPrompt,
                timestamp: Date.now()
            };

            setLocalCompositeResults(prev => [...prev, newResult]);

        } catch (error: any) {
            console.error("Variation Error", error);
            errors.push(error.message);
        } finally {
            completedCount++;
            setGenerationCount(completedCount);
        }
    };

    for (let i = 0; i < loopCount; i++) {
        await generateVariation(i);
    }

    if (errors.length > 0) {
        alert(`Terjadi kesalahan pada ${errors.length} variasi. Error: ${errors[0]}`);
    }

    setInternalProcessing(false);
    setGenerationCount(0);
  };

  // --- COMPOSITE GENERATOR (Legacy for FaceSwap, Join, Carousel) ---
  const handleCompositeGenerate = async (prompt: string, aspectRatio?: AspectRatio) => {
    const isFaceSwap = selectedFeature?.id === 'faceswap';
    const isCarousel = selectedFeature?.id === 'carousel';

    if (isFaceSwap && uploadedImages.length !== 2) {
      alert("Untuk Face Swap, Anda wajib mengunggah 2 foto: 1. Wajah Sumber, 2. Foto Target.");
      return;
    }
    // Carousel allows 0 or more
    if (!isFaceSwap && !isCarousel && uploadedImages.length < 2) {
      alert("Mohon unggah minimal 2 foto untuk digabungkan.");
      return;
    }
    
    setInternalProcessing(true);
    setLocalCompositeResults([]); 
    
    let instruction = selectedFeature?.systemPrompt;
    let finalPrompt = prompt;
    
    if (isFaceSwap) {
       instruction = `
         ROLE: Elite VFX Artist specializing in High-Fidelity Face Replacement.
         [STRICT SYSTEM INSTRUCTION: FACE DNA PRESERVATION]
         - Analyze and lock the Face DNA from Image 1.
         - Transfer the identity to Image 2 with 100% accuracy.
         - Preserve bone structure and unique features.
         [INPUT IDENTIFICATION]
         - **IMAGE 1 (First Input)**: SOURCE FACE IDENTITY.
         - **IMAGE 2 (Second Input)**: TARGET BODY/SCENE.
         [TASK] Replace face in Image 2 with face from Image 1.
         [RULES] Keep Image 2's background, hair, body EXACTLY the same. Blend skin tone.
       `.trim();
       
       finalPrompt = `
         FACE SWAP OPERATION:
         Base: Image 2. Face Source: Image 1.
         INSTRUCTION: Swap face. Preserve Face DNA and Base Image details.
       `.trim();
    }

    const loopCount = isFaceSwap ? 1 : 4; // Carousel gets 4 slides
    let completedCount = 0;
    const errors: string[] = [];

    const generateComposite = async (i: number) => {
      try {
        let currentPrompt = finalPrompt;
        
        if (isCarousel) {
           const slideNum = i + 1;
           currentPrompt = `
             ${finalPrompt}
             [CAROUSEL SLIDE ${slideNum}/4]
             CONTEXT: Slide #${slideNum} of a continuous sequence.
             TASK: Generate content for this specific slide part.
             CONSISTENCY: Match style/fonts of previous slides.
           `.trim();
        }

        let resultBase64 = "";
        
        if (isCarousel && uploadedImages.length === 0) {
             // Text-to-Image Carousel
             resultBase64 = await editImageWithGemini(
                null, "image/png", currentPrompt, instruction, aspectRatio || '1:1', userApiKey
             );
        } else {
             // Composite
             resultBase64 = await generateCompositeImage(
              uploadedImages, currentPrompt, aspectRatio || '1:1', instruction, userApiKey
            );
        }
        
        const newResult: ProcessedImage = {
          id: Date.now().toString() + i,
          original: uploadedImages.length > 0 ? `data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].base64}` : `data:image/png;base64,${resultBase64}`,
          result: resultBase64,
          prompt: finalPrompt,
          timestamp: Date.now()
        };
        
        setLocalCompositeResults(prev => [...prev, newResult]);
      } catch (error: any) {
        console.error("Error generating composite", error);
        errors.push(error.message);
      } finally {
        completedCount++;
        setGenerationCount(completedCount);
      }
    };

    for (let i = 0; i < loopCount; i++) {
        await generateComposite(i);
    }

    if (errors.length > 0) {
        alert(`Gagal memproses gambar: ${errors[0]}`);
    }

    setInternalProcessing(false);
    setGenerationCount(0);
  };

  // --- INPAINTING (EDIT) ---
  const handleInpaintGenerate = async (prompt: string) => {
    if (!originalImage || !canvasRef.current || !imgDimensions) return;
    setInternalProcessing(true);
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgDimensions.w;
      tempCanvas.height = imgDimensions.h;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error("Context failed");

      const img = new Image();
      img.src = originalImage;
      await new Promise(r => img.onload = r);
      ctx.drawImage(img, 0, 0);

      const originalData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const maskCtx = canvasRef.current.getContext('2d');
      if (!maskCtx) throw new Error("Mask context failed");
      const maskData = maskCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 0) {
          originalData.data[i + 3] = 0;
        }
      }
      ctx.putImageData(originalData, 0, 0);
      const holedBase64 = tempCanvas.toDataURL('image/png').split(',')[1];

      const finalPrompt = `tambahkan ${prompt} pada area yang diseleksi, sesuaikan style/lighting.`;

      const resultBase64 = await editImageWithGemini(
        holedBase64, 'image/png', finalPrompt, 
        "ROLE: Expert Inpainter. TASK: Fill transparent areas seamlessly.", '1:1', userApiKey
      );

      const newResult: ProcessedImage = {
        id: Date.now().toString(),
        original: originalImage,
        result: resultBase64,
        prompt: prompt,
        timestamp: Date.now()
      };
      
      setLocalCompositeResults([newResult]); // Single result for Inpaint
      onSelectResult(newResult);

    } catch (e) {
      console.error(e);
      alert("Gagal mengedit gambar.");
    } finally {
      setInternalProcessing(false);
    }
  };

  // --- OUTPAINTING (EXPAND) ---
  const setExpandRatio = (ratioW: number, ratioH: number) => {
    if (!imgDimensions) return;
    const currentAspect = imgDimensions.w / imgDimensions.h;
    const targetAspect = ratioW / ratioH;
    let newTop = 0, newBottom = 0, newLeft = 0, newRight = 0;

    if (currentAspect > targetAspect) {
      const newH = imgDimensions.w / targetAspect;
      const totalPadH = newH - imgDimensions.h;
      const pct = (totalPadH / 2) / imgDimensions.h * 100;
      newTop = pct; newBottom = pct;
    } else {
      const newW = imgDimensions.h * targetAspect;
      const totalPadW = newW - imgDimensions.w;
      const pct = (totalPadW / 2) / imgDimensions.w * 100;
      newLeft = pct; newRight = pct;
    }
    setExpandSettings({ top: newTop, bottom: newBottom, left: newLeft, right: newRight });
  };

  const handleExpandGenerate = async () => {
    if (!originalImage) return;
    if (expandSettings.top === 0 && expandSettings.bottom === 0 && expandSettings.left === 0 && expandSettings.right === 0) {
      alert("Harap atur slider untuk memperluas area.");
      return;
    }
    setInternalProcessing(true);
    try {
      const img = new Image();
      img.src = originalImage;
      await new Promise(r => img.onload = r);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");

      const w = img.width;
      const h = img.height;
      const pTop = (expandSettings.top / 100) * h;
      const pBottom = (expandSettings.bottom / 100) * h;
      const pLeft = (expandSettings.left / 100) * w;
      const pRight = (expandSettings.right / 100) * w;

      const newW = w + pLeft + pRight;
      const newH = h + pTop + pBottom;
      canvas.width = newW; canvas.height = newH;

      ctx.fillStyle = "#ffffff"; 
      ctx.fillRect(0, 0, newW, newH);
      ctx.drawImage(img, pLeft, pTop, w, h);

      const paddedBase64Full = canvas.toDataURL('image/png');
      const paddedBase64Raw = paddedBase64Full.split(',')[1];
      const autoPrompt = "Outpaint: Fill the surrounding white space seamlessly. Match lighting/texture.";

      const resultBase64 = await editImageWithGemini(
        paddedBase64Raw, 'image/png', autoPrompt, selectedFeature?.systemPrompt, '1:1', userApiKey
      );

      const newResult: ProcessedImage = {
        id: Date.now().toString(),
        original: paddedBase64Full,
        result: resultBase64,
        prompt: autoPrompt,
        timestamp: Date.now()
      };
      setLocalCompositeResults([newResult]); // Single result for Expand
      onSelectResult(newResult);

    } catch (e) {
      console.error(e);
      alert("Gagal memperluas gambar.");
    } finally {
      setInternalProcessing(false);
    }
  };

  const isMultiMode = selectedFeature?.allowMultiUpload;
  const isExpandMode = selectedFeature?.id === 'expand';
  const isEditMode = selectedFeature?.id === 'edit';
  const isFaceSwap = selectedFeature?.id === 'faceswap';
  const isProductMode = selectedFeature?.id === 'product';
  const isMascotMode = selectedFeature?.id === 'mascot';
  const isBannerMode = selectedFeature?.id === 'banner';
  const isCarouselMode = selectedFeature?.id === 'carousel';
  const isPrewedMode = selectedFeature?.id === 'prewed';
  const isPasFotoMode = selectedFeature?.id === 'pasfoto';
  const isLogoMode = selectedFeature?.id === 'logo';
  
  // Decide which results to show
  // If the feature is in VARIATION_IDS, use localCompositeResults (grid view)
  const isGridFeature = selectedFeature && VARIATION_IDS.includes(selectedFeature.id);
  const isCompositeFeature = isMultiMode || isCarouselMode; // Join, Carousel, etc.

  // Logic: Show Grid if GridFeature OR CompositeFeature (except FaceSwap single result) OR Inpaint/Expand (single result stored in local)
  const displayResults = (isGridFeature || isCompositeFeature || isExpandMode || isEditMode) ? localCompositeResults : results;
  
  // Grid View is active for Multi-Variant features
  const showGridView = isGridFeature || (isCompositeFeature && !isFaceSwap);

  const loading = isProcessing || internalProcessing;

  if (!selectedFeature) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in-up">
        <div className="text-center max-w-2xl px-4 space-y-8">
          <div className="relative inline-block">
            <div 
              className="absolute inset-0 blur-3xl rounded-full opacity-20"
              style={{ backgroundColor: appSettings.themeColor }}
            ></div>
            <h2 className="relative text-7xl md:text-9xl font-black text-white serif tracking-tighter leading-none">
              {appSettings.appName}
            </h2>
          </div>
          <p 
            className="elegant-caps tracking-[0.3em]"
            style={{ color: appSettings.themeColor }}
          >
            {appSettings.appTagline}
          </p>
          <div className="w-12 h-px bg-zinc-800 mx-auto"></div>
          <p className="text-zinc-400 font-light italic serif text-lg">Pilih alat dari menu untuk mulai berkreasi.</p>
          
          <div className="pt-12 opacity-40">
            <p className="text-[10px] elegant-caps tracking-[0.4em] mb-2">by</p>
            <p 
              className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: appSettings.themeColor }}
            >
              Bwork Digital agency & Content Studio
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 animate-fade-in items-start">
      
      {/* --- LEFT COLUMN: INPUT DATA (30%) --- */}
      <div className="w-full lg:w-[30%] flex flex-col gap-8">
        
        {/* Header / Title Area */}
        <div className="border-b border-zinc-900 pb-6">
          <h2 className="text-3xl font-light text-white mb-2 serif tracking-tight">{selectedFeature.label}</h2>
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
             {isFaceSwap 
               ? "Wajib unggah 2 foto: 1. Wajah Sumber, 2. Foto Target. Wajah sumber akan dipasang ke foto target."
               : isProductMode
               ? "Unggah foto produk. Opsional tambahkan model."
               : isMascotMode
               ? "Buat karakter unik untuk brand Anda."
               : isBannerMode
               ? "Buat materi promosi menarik."
               : isCarouselMode
               ? "Buat 4 slide presentasi/sosmed."
               : isMultiMode 
               ? "Gabungkan beberapa foto menjadi satu." 
               : isExpandMode
               ? "Perluas area gambar dengan AI."
               : isEditMode
               ? "Hapus atau ganti objek spesifik."
               : "Ubah foto dengan satu klik ajaib."}
          </p>
          {(originalImage || uploadedImages.length > 0) && (
             <button 
               onClick={() => {
                 onReset();
                 setUploadedImages([]);
                 setLocalCompositeResults([]);
                 setExpandSettings({ top: 0, right: 0, bottom: 0, left: 0 });
                 setUseModel(false);
                 clearCanvas();
               }}
               className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                 <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
               </svg>
               Reset Sesi
             </button>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex flex-col gap-4">
           
           {/* Custom Face Swap UI */}
           {isFaceSwap && (
             <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-teal-400 uppercase flex items-center gap-2">
                     <span className="w-4 h-4 rounded-full bg-teal-500 text-black flex items-center justify-center text-[10px]">1</span>
                     Unggah Wajah Sumber
                   </span>
                   {uploadedImages[0]?.base64 ? (
                     <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-teal-500/50 group">
                        <img src={`data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].base64}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(0)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                        </button>
                     </div>
                   ) : (
                     <div className="w-full aspect-[21/9] rounded-lg border-2 border-dashed border-zinc-700 hover:border-teal-500/50 bg-zinc-900/50 hover:bg-zinc-800 transition-all overflow-hidden relative">
                        <div className="absolute inset-0 opacity-0 z-10 cursor-pointer">
                           <ImageUploader onImageSelected={(b, m) => handleSpecificImageUpload(0, b, m)} />
                        </div>
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
                           <span className="text-xs">Klik untuk upload wajah</span>
                        </div>
                     </div>
                   )}
                </div>

                <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-pink-400 uppercase flex items-center gap-2">
                     <span className="w-4 h-4 rounded-full bg-pink-500 text-black flex items-center justify-center text-[10px]">2</span>
                     Unggah Foto Target
                   </span>
                   {uploadedImages[1]?.base64 ? (
                     <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-pink-500/50 group">
                        <img src={`data:${uploadedImages[1].mimeType};base64,${uploadedImages[1].base64}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(1)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                        </button>
                     </div>
                   ) : (
                     <div className="w-full aspect-[21/9] rounded-lg border-2 border-dashed border-zinc-700 hover:border-pink-500/50 bg-zinc-900/50 hover:bg-zinc-800 transition-all overflow-hidden relative">
                        <div className="absolute inset-0 opacity-0 z-10 cursor-pointer">
                           <ImageUploader onImageSelected={(b, m) => handleSpecificImageUpload(1, b, m)} />
                        </div>
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
                           <span className="text-xs">Klik untuk upload target</span>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* Custom Pre-wedding/Wedding UI */}
           {isPrewedMode && (
             <div className="flex flex-col gap-4">
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button onClick={() => setWeddingType('Pre-wedding')} className={`flex-1 text-xs py-2 rounded-md transition-all ${weddingType === 'Pre-wedding' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Pre-wedding</button>
                  <button onClick={() => setWeddingType('Wedding')} className={`flex-1 text-xs py-2 rounded-md transition-all ${weddingType === 'Wedding' ? 'bg-rose-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Wedding</button>
                </div>
                <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-sky-400 uppercase">Mempelai Pria</span>
                   {uploadedImages[0]?.base64 ? (
                     <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-sky-500/50 group">
                        <img src={`data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].base64}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(0)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">x</button>
                     </div>
                   ) : (
                     <div className="w-full aspect-[4/5] rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:border-sky-500/50 transition-all relative overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 z-10 opacity-0 cursor-pointer">
                           <ImageUploader onImageSelected={(b, m) => handleSpecificImageUpload(0, b, m)} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-500 gap-2">
                           <svg className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           <span className="text-xs">Klik Upload Pria</span>
                        </div>
                     </div>
                   )}
                </div>
                <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-pink-400 uppercase">Mempelai Wanita</span>
                   {uploadedImages[1]?.base64 ? (
                     <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-pink-500/50 group">
                        <img src={`data:${uploadedImages[1].mimeType};base64,${uploadedImages[1].base64}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(1)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">x</button>
                     </div>
                   ) : (
                     <div className="w-full aspect-[4/5] rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:border-pink-500/50 transition-all relative overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 z-10 opacity-0 cursor-pointer">
                           <ImageUploader onImageSelected={(b, m) => handleSpecificImageUpload(1, b, m)} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-500 gap-2">
                           <svg className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           <span className="text-xs">Klik Upload Wanita</span>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* Custom Product UI */}
           {isProductMode && (
             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-emerald-400 uppercase">Produk</span>
                   {uploadedImages[0] ? (
                     <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-emerald-500/50 group">
                        <img src={`data:${uploadedImages[0].mimeType};base64,${uploadedImages[0].base64}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(0)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">x</button>
                     </div>
                   ) : <div className="w-full aspect-square rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 relative"><ImageUploader onImageSelected={handleMultiImageUpload} /><div className="absolute inset-0 pointer-events-none flex items-center justify-center text-zinc-500 text-xs">Produk</div></div>}
                </div>

                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button onClick={() => { setUseModel(false); if(uploadedImages.length > 1) removeImage(1); }} className={`flex-1 text-xs py-2 rounded-md transition-all ${!useModel ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Produk Saja</button>
                  <button onClick={() => setUseModel(true)} className={`flex-1 text-xs py-2 rounded-md transition-all ${useModel ? 'bg-teal-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>+ Model</button>
                </div>

                {useModel && (
                  <div className="flex flex-col gap-2 animate-fade-in-up">
                    <span className="text-xs font-bold text-teal-400 uppercase">Model</span>
                    {uploadedImages[1]?.base64 ? (
                      <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-teal-500/50 group">
                          <img src={`data:${uploadedImages[1].mimeType};base64,${uploadedImages[1].base64}`} className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(1)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all">x</button>
                      </div>
                    ) : <div className="w-full aspect-[4/5] rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 relative"><div className="absolute inset-0 opacity-0 z-10 cursor-pointer"><ImageUploader onImageSelected={(b, m) => handleSpecificImageUpload(1, b, m)} /></div><div className="absolute inset-0 pointer-events-none flex items-center justify-center text-zinc-500 text-xs">Model</div></div>}
                  </div>
                )}
             </div>
           )}

           {/* Generic Multi Upload (Join/Carousel) */}
           {((isMultiMode && !isFaceSwap && !isProductMode && !isPrewedMode) || (isCarouselMode && uploadedImages.length > 0)) && (
             <div className="flex flex-col gap-3">
               <span className="text-xs font-bold text-zinc-500 uppercase">Foto Masukan ({uploadedImages.length}/5)</span>
               <div className="grid grid-cols-3 gap-2">
                 {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 group">
                       <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover" />
                       <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-all backdrop-blur-sm"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
                    </div>
                  ))}
                  {uploadedImages.length < 5 && (
                    <div className="relative aspect-square border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer group">
                        <div className="absolute inset-0 z-10 opacity-0 cursor-pointer"><ImageUploader onImageSelected={handleMultiImageUpload} /></div>
                        <span className="text-xl">+</span>
                    </div>
                  )}
               </div>
             </div>
           )}

           {/* Single Upload View - Used for most Standard features */}
           {!isMultiMode && !isCarouselMode && !originalImage && (
             <div className="w-full aspect-square md:aspect-video rounded-xl overflow-hidden relative group">
                {isMascotMode && <div className="absolute top-2 left-2 z-20 bg-teal-600/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none">Foto Referensi (Opsional)</div>}
                <ImageUploader onImageSelected={onImageSelected} />
             </div>
           )}
           
           {/* Carousel Empty State */}
           {isCarouselMode && uploadedImages.length === 0 && (
             <div className="w-full aspect-[21/9] rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 relative">
                <div className="absolute inset-0 opacity-0 z-10 cursor-pointer"><ImageUploader onImageSelected={handleMultiImageUpload} /></div>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-zinc-500 text-xs">Klik untuk upload (Opsional)<br/>atau langsung ketik prompt</div>
             </div>
           )}

           {/* Single Preview View */}
           {!isMultiMode && !isCarouselMode && originalImage && (
             <div className="w-full flex flex-col gap-4">
                <div className="relative w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4">
                    {/* Expand Feature */}
                    {isExpandMode && (
                      <div className="relative bg-white shadow-2xl" style={{width: `${50 * (100 / (100 + expandSettings.left + expandSettings.right))}%`, height: 'auto', aspectRatio: 'auto'}}>
                           <img src={originalImage} className="w-full h-auto object-cover" />
                           {/* Overlays removed for brevity, logic remains */}
                      </div>
                    )}
                    {/* Edit Feature */}
                    {isEditMode && (
                        <div className="relative inline-block border border-zinc-700 shadow-2xl">
                            <img ref={imageRef} src={originalImage} className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                            <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} width={imgDimensions?.w || 500} height={imgDimensions?.h || 500} />
                        </div>
                    )}
                    {!isExpandMode && !isEditMode && <img src={originalImage} className="w-full h-full object-contain" />}
                </div>
                <div className="flex justify-between items-center">
                     {isEditMode && <div className="text-[10px] text-zinc-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500/50"></span>Gambar area untuk diseleksi</div>}
                     <button onClick={onReset} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-full transition-colors">Ganti Foto</button>
                </div>
             </div>
           )}
        </div>

        {/* --- CONTROLS --- */}
        
        {isMascotMode && (
            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase">Detail Karakter</h3>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500">Tipe</label>
                    <select value={mascotType} onChange={(e) => setMascotType(e.target.value)} className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none">
                        <option value="Hewan">Hewan</option><option value="Manusia">Manusia</option><option value="Kartun">Kartun</option><option value="3D">3D</option><option value="Chibi">Chibi</option>
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500">Warna Brand</label>
                    <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="Biru Tosca" className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none" />
                 </div>
            </div>
        )}

        {isBannerMode && (
            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase">Konten Banner</h3>
                 <select value={bannerStyle} onChange={(e) => setBannerStyle(e.target.value)} className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none">
                        <option value="simple">Minimalis</option><option value="background">Background Tematik</option><option value="pro">Profesional (Full Efek)</option>
                 </select>
                 <input type="text" value={bannerTexts.main} onChange={(e) => setBannerTexts(p => ({...p, main: e.target.value}))} placeholder="Headline Utama" className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none" />
                 <input type="text" value={bannerTexts.support} onChange={(e) => setBannerTexts(p => ({...p, support: e.target.value}))} placeholder="Sub-judul" className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none" />
                 <input type="text" value={bannerTexts.footer} onChange={(e) => setBannerTexts(p => ({...p, footer: e.target.value}))} placeholder="Footer Info" className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none" />
                 <div className="flex items-center gap-2 pt-2 border-t border-zinc-800"><input type="checkbox" checked={showCTA} onChange={(e) => setShowCTA(e.target.checked)} /><span className="text-xs text-white">Tombol CTA</span></div>
                 {showCTA && <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Teks Tombol" className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none" />}
            </div>
        )}

        {isPasFotoMode && (
            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase">Pengaturan Pas Foto</h3>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500">Warna Background</label>
                    <div className="flex gap-2">
                        {['Merah', 'Biru', 'Putih'].map(color => (
                            <button 
                                key={color}
                                onClick={() => setPasFotoColor(color)}
                                className={`flex-1 py-2 text-xs rounded-lg border transition-all ${pasFotoColor === color ? 'bg-zinc-700 border-teal-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500">Pakaian Formal</label>
                    <select value={pasFotoAttire} onChange={(e) => setPasFotoAttire(e.target.value)} className="w-full bg-zinc-800 text-white text-sm p-2 rounded-lg border border-zinc-700 outline-none">
                        <option value="Kemeja Putih">Kemeja Putih</option>
                        <option value="Jas Hitam & Kemeja Putih">Jas Hitam & Kemeja Putih</option>
                        <option value="Batik Formal">Batik Formal</option>
                        <option value="Blazer Wanita">Blazer Wanita</option>
                        <option value="Seragam Sekolah">Seragam Sekolah</option>
                    </select>
                 </div>
            </div>
        )}

        {isExpandMode && (
            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase">Perluas Area</h3>
                 <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setExpandSettings({ top: 10, right: 10, bottom: 10, left: 10 })} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] border border-zinc-700">+10%</button>
                   <button onClick={() => setExpandRatio(1, 1)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] border border-zinc-700">1:1</button>
                   <button onClick={() => setExpandRatio(4, 5)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] border border-zinc-700">4:5</button>
                   <button onClick={() => setExpandRatio(16, 9)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] border border-zinc-700">16:9</button>
                 </div>
                 {/* Sliders simplified */}
                 <div className="flex flex-col gap-2">
                    {['top', 'bottom', 'left', 'right'].map(side => (
                        <div key={side} className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 capitalize">{side} {Math.round((expandSettings as any)[side])}%</label>
                            <input type="range" min="0" max="100" value={(expandSettings as any)[side]} onChange={(e) => setExpandSettings(s => ({...s, [side]: Number(e.target.value)}))} className="accent-teal-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    ))}
                 </div>
                 <button onClick={handleExpandGenerate} disabled={loading || !originalImage} className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl mt-2">{loading ? "Memperluas..." : "Perluas Ajaib"}</button>
            </div>
        )}

        {isEditMode && (
           <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
               <h3 className="text-xs font-bold text-zinc-400 uppercase">Kuas Seleksi</h3>
               <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-teal-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
               <button onClick={clearCanvas} className="text-xs text-red-400 bg-red-900/10 border border-red-900/50 px-3 py-2 rounded">Hapus Seleksi</button>
               <Controls onGenerate={(p) => handleInpaintGenerate(p)} isLoading={loading} disabled={loading || !originalImage} selectedFeature={selectedFeature} />
           </div>
        )}

        {!isExpandMode && !isEditMode && (
            <Controls 
                onGenerate={(prompt, aspectRatio) => {
                   if (VARIATION_IDS.includes(selectedFeature.id)) {
                       // NEW: Unified Handler for Grid Features
                       handleUnifiedVariations(prompt, aspectRatio);
                   } else if (isMultiMode || isCarouselMode) {
                       // Legacy Composite Handler
                       handleCompositeGenerate(prompt, aspectRatio);
                   } else {
                       // Single Generation (Default)
                       parentOnGenerate(prompt, aspectRatio);
                   }
                }}
                isLoading={loading}
                // Validation Logic
                disabled={
                    loading || 
                    (isMultiMode && uploadedImages.length < (isProductMode && !useModel ? 1 : 2)) || // Product single needs 1, others 2
                    (!isMultiMode && !isCarouselMode && !isPrewedMode && !originalImage && !isMascotMode && !isBannerMode && !isLogoMode)
                }
                selectedFeature={selectedFeature}
                hidePromptInput={isFaceSwap}
            />
        )}
      </div>


      {/* --- RIGHT COLUMN: RESULT DISPLAY (70%) --- */}
      <div className="w-full lg:w-[70%] bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-4 relative min-h-[500px]">
        
        {loading && (
          <>
            <style>{`
              @keyframes neon-slide {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
              }
              .animate-neon-slide {
                animation: neon-slide 1.5s infinite ease-in-out;
              }
            `}</style>
            
            {/* Neon Progress Bar at Top */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-800/50 z-50 overflow-hidden rounded-t-2xl">
               <div className="h-full w-1/3 bg-teal-400 shadow-[0_0_15px_#2dd4bf] rounded-full animate-neon-slide"></div>
            </div>

            {/* Glowing Loading Badge */}
            <div className="absolute top-6 right-6 z-20 bg-teal-900/80 border border-teal-500/50 text-teal-100 text-xs font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.4)] flex items-center gap-3 backdrop-blur-md">
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
               </div>
               {isCarouselMode 
                  ? `Membuat Slide ${Math.min(generationCount + 1, 4)} dari 4...` 
                  : (selectedFeature.id === 'prewed' || selectedFeature.id === 'pasfoto' || selectedFeature.id === 'faceswap' || selectedFeature.id === 'retouch')
                    ? (
                       <div className="flex flex-col items-start leading-tight">
                          <span>Analyzing Face DNA...</span>
                          <span className="text-[8px] opacity-60 font-mono uppercase tracking-tighter">High-Accuracy Studio Mode</span>
                       </div>
                     )
                    : 'Memproses Gambar...'}
            </div>
            
            {/* Overlay for the entire result area to show it's loading */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="text-teal-400/50 font-mono text-sm tracking-widest animate-pulse">
                    GENERATING...
                </div>
            </div>
          </>
        )}

        {/* GRID DISPLAY FOR MULTI-VARIANT */}
        {showGridView ? (
          <div className="flex flex-col gap-4">
            <div className={`grid gap-4 ${isCarouselMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto w-full'}`}>
              {displayResults.map((result, index) => (
                  <div key={index} className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${result ? 'border-teal-500/50 bg-black' : 'border-zinc-800 bg-zinc-900/50 border-dashed'}`}>
                      <div className="group w-full h-full relative">
                        <img src={`data:image/png;base64,${result.result}`} className="w-full h-full object-contain" />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          {isCarouselMode ? `Slide ${index + 1}` : `Hasil`}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <a href={`data:image/png;base64,${result.result}`} download={`studio-result-${index+1}.png`} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                           <button onClick={() => onSelectResult(result)} className="p-2 bg-teal-600 text-white rounded-full hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></button>
                        </div>
                      </div>
                  </div>
              ))}
              {displayResults.length === 0 && !loading && (
                  <div className="w-full aspect-square flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/20 rounded-xl border-2 border-dashed border-zinc-800">
                      <span className="text-sm">Hasil akan muncul di sini</span>
                  </div>
              )}
            </div>
          </div>
        ) : (
          // SINGLE PREVIEW (FaceSwap, Inpaint, Expand, etc)
          <div className="flex flex-col">
             <ComparisonView 
                originalImage={isExpandMode && localCompositeResults.length > 0 
                    ? localCompositeResults[0].original 
                    : (originalImage || (uploadedImages[1] ? `data:${uploadedImages[1].mimeType};base64,${uploadedImages[1].base64}` : ''))
                }
                resultImage={
                    ((isExpandMode || isEditMode || isFaceSwap) && localCompositeResults.length > 0)
                    ? localCompositeResults[0].result
                    : (activeResultId && displayResults.find(r => r.id === activeResultId)?.result || null)
                }
                isLoading={loading}
              />
          </div>
        )}
      </div>
    </div>
  );
};