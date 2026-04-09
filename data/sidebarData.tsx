import React from 'react';
import { FeatureCategory } from '../types';

// Icons styling kept consistent
const iconClass = "w-5 h-5";

const Icons = {
  Join: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Miniature: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Expand: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Edit: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  FaceSwap: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Artist: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  RemoveBG: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Product: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Fashion: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Mockup: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  Banner: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  Hand: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>,
  Video: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Heart: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  User: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Scissor: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>,
  Home: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Pencil: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Cube: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Restore: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Star: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Moon: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Camera: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

export const MENU_CATEGORIES: FeatureCategory[] = [
  {
    title: "Edit & Gabung",
    items: [
      { 
        id: 'join', 
        label: 'Gabung Foto', 
        icon: Icons.Join, 
        systemPrompt: "ROLE: Professional Photo Compositor. TASK: Create a single, seamless composition using the provided input images. REQUIREMENTS: 1. Harmonize lighting, shadows, and perspective across all elements. 2. If 'Auto' prompt is used, creatively determine the best way to combine them (e.g., collage, scene integration, or fantasy blend). 3. Output a high-quality, photorealistic result.",
        placeholder: "Instruksi penggabungan (atau klik Prompt Otomatis Ajaib)...",
        allowMultiUpload: true,
        quickPrompts: [
            "Gabungkan menjadi adegan fantasi", 
            "Buat kolase modern", 
            "Satukan dengan halus", 
            "Tempatkan objek ke latar belakang"
        ]
      },
      { 
        id: 'restore', 
        label: 'Perbaiki Foto', 
        icon: Icons.Restore, 
        systemPrompt: "ROLE: Expert Photo Restorer & Archivist. TASK: Restore the old, damaged, or low-quality photo to pristine HD condition. REQUIREMENTS: 1. REMOVE all scratches, dust, creases, tear marks, and mold spots. 2. DENOISE heavily to remove grain. 3. FACE RESTORATION: Sharpen facial details, eyes, and skin texture to look realistic and defined. 4. COLOR CORRECTION: If the photo is faded/sepia, restore natural contrast. If B&W, implied task is to COLORIZE it naturally unless requested to keep B&W. 5. Output must be crisp, 8K resolution, and professionally cleaned.",
        placeholder: "Jelaskan kondisi foto (misal: foto jadul tahun 90an)...",
        quickPrompts: [
            "Warnai foto hitam putih lama",
            "Perbaiki goresan dan pertajam detail",
            "Tingkatkan warna pudar dan hapus blur",
            "Bersihkan debu dan bekas sobekan"
        ]
      },
      { 
        id: 'faceswap', 
        label: 'Face Swap', 
        icon: Icons.FaceSwap, 
        systemPrompt: "ROLE: Expert VFX Artist & Photo Manipulator. TASK: Perform a seamless FACE SWAP using the provided images. INSTRUCTIONS: The FIRST image is the SOURCE FACE. The SECOND image is the TARGET BODY/SCENE. 1. Extract the facial features from the SOURCE FACE. 2. Apply them onto the subject in the TARGET PHOTO. 3. STRICTLY MATCH the skin tone, lighting angle, grain, and resolution of the TARGET PHOTO. 4. Ensure the blending at the neck and hairline is invisible. 5. Maintain the expression of the target photo unless specified otherwise. OUTPUT: A photorealistic image where the target person now looks like the source person.",
        placeholder: "Klik 'Buat Gambar' untuk menukar wajah...",
        allowMultiUpload: true, // Enabled for 2-step process
        quickPrompts: [
            "Tukar wajah dengan mulus",
            "Sesuaikan ekspresi wajah asli",
            "Buat terlihat lebih muda",
            "Tukar wajah gaya sinematik"
        ]
      },
      { 
        id: 'miniature', 
        label: 'Foto Miniature', 
        icon: Icons.Miniature, 
        systemPrompt: "ROLE: 3D Clay Miniature Artist & Macro Photographer. TASK: Transform the main subject from the photo into a realistic, cute small clay figurine (plasticine style) placed within a life-sized environment. REQUIREMENTS: 1. TEXTURE: Give the subject a soft, matte clay texture with rounded edges (cute 3D style). 2. SCALE: The subject must appear tiny (macro scale) relative to the background elements which should remain normal size. 3. CONTEXT: The background remains realistic and normal-sized to emphasize the miniature effect. 4. INTERACTION: Make the clay figure interact playfully with the giant surroundings (e.g., climbing a cup, sitting on a leaf, hiding behind a pen). 5. LIGHTING: Use shallow depth of field (bokeh) to focus on the clay figure.",
        placeholder: "Sedang melakukan apa di dunia raksasa ini?",
        quickPrompts: [
            "Duduk di atas daun raksasa",
            "Memanjat cangkir kopi",
            "Tidur di keyboard laptop",
            "Bersembunyi di balik pulpen raksasa"
        ]
      },
      { 
        id: 'expand', 
        label: 'Perluas Foto', 
        icon: Icons.Expand, 
        systemPrompt: "ROLE: AI Image Outpainter. TASK: The input image contains the ORIGINAL PHOTO in the center (or offset), surrounded by plain WHITE/BLANK space. Your job is to FILL the white space to expand the scene. REQUIREMENTS: 1. Analyze the edges of the central image. 2. GENERATE new content in the blank areas that perfectly matches the perspective, lighting, and style of the central image. 3. DO NOT change the central image content, only extend it. 4. Ensure seamless transitions (no visible seams). 5. If the original is a landscape, extend the horizon. If it's a room, extend the walls/furniture.",
        placeholder: "Atur slider area perluasan...",
        quickPrompts: []
      },
      { 
        id: 'edit', 
        label: 'Edit Foto', 
        icon: Icons.Edit, 
        systemPrompt: "ROLE: Senior Photo Retoucher. TASK: Execute the user's specific editing request with precision. REQUIREMENTS: 1. If changing colors, use precise masking. 2. If changing time of day, adjust global lighting, sky color, and shadows accordingly. 3. Maintain skin texture and fine details. 4. Ensure the result looks like a native photograph, not a digital manipulation.",
        placeholder: "Apa yang ingin diubah?",
        quickPrompts: [
            "Ubah langit jadi matahari terbenam",
            "Buat suasana bersalju",
            "Hapus semua orang",
            "Ubah warna jadi hitam putih"
        ]
      },
      { 
        id: 'artist', 
        label: 'Foto Artis', 
        icon: Icons.Artist, 
        systemPrompt: "ROLE: Celebrity Stylist & Photographer. TASK: Transform the subject to have the aesthetic of a high-profile celebrity. REQUIREMENTS: 1. Enhance makeup, hair volume, and skin glow (Hollywood standard). 2. Adjust lighting to 'Red Carpet' or 'Magazine Cover' style (Butterfly or Rembrandt lighting). 3. Make the subject look charismatic and star-quality while retaining their identity.",
        placeholder: "Gaya artis siapa yang diinginkan?",
        quickPrompts: [
            "Gaya Idol K-Pop",
            "Bintang Hollywood Klasik",
            "Estetika Rockstar",
            "Glamor Karpet Merah"
        ]
      },
      { 
        id: 'removebg', 
        label: 'Hapus BG', 
        icon: Icons.RemoveBG, 
        systemPrompt: "ROLE: Masking Specialist. TASK: Remove the background completely. REQUIREMENTS: 1. Perform complex hair masking and edge detection. 2. Return the subject on a pure WHITE background (unless TRANSPARENT is requested). 3. No green/blue spill from the original background. 4. Keep shadows only if they ground the subject naturally.",
        placeholder: "Pilih jenis background...",
        quickPrompts: [
            "Latar belakang putih murni",
            "Latar belakang transparan",
            "Latar belakang abu-abu studio",
            "Layar hijau (Green screen)"
        ]
      }
    ]
  },
  {
    title: "Produk & Promosi",
    items: [
      { 
        id: 'product', 
        label: 'Foto Produk', 
        icon: Icons.Product, 
        systemPrompt: "ROLE: Commercial Product Photographer & Art Director. TASK: Elevate the product image to e-commerce gold standard. REQUIREMENTS: 1. If a MODEL is provided (Image 2), create a high-quality ADVERTISING POSTER where the model interacts with the product (holding it, using it, or posing with it) in a professional manner. 2. If NO MODEL is provided, focus solely on the product. 3. Ensure the product is perfectly sharp and evenly lit. 4. Generate a premium background (marble, wooden, or podium) as described. 5. Output must look like a high-budget commercial photoshoot.",
        placeholder: "Deskripsikan setting produk...",
        allowMultiUpload: true, // Enabled to allow "With Model" flow
        quickPrompts: [
            "Di atas meja marmer putih",
            "Podium gelap mewah cahaya emas",
            "Sinar matahari alami meja kayu",
            "Latar belakang percikan air"
        ]
      },
      { 
        id: 'fashion', 
        label: 'Foto Fashion', 
        icon: Icons.Fashion, 
        systemPrompt: "ROLE: Vogue Editorial Photographer. TASK: Style the image for a fashion magazine spread. REQUIREMENTS: 1. Focus on the outfit/garment details. 2. Apply dramatic, high-fashion lighting (hard light or cinematic). 3. Color grade with a modern, trendy aesthetic (e.g., film grain, muted tones, or vibrant pop). 4. Ensure the pose looks intentional and modeled.",
        placeholder: "Tema fashion apa?",
        quickPrompts: [
            "Streetwear di Neon Tokyo",
            "Kafe Mewah Paris",
            "Studio Minimalis High Fashion",
            "Nuansa Pantai Bohemian"
        ]
      },
      { 
        id: 'mockup', 
        label: 'Buat Mockup', 
        icon: Icons.Mockup, 
        systemPrompt: "ROLE: Mockup Designer. TASK: Apply the provided image/logo onto a physical object naturally. REQUIREMENTS: 1. Account for the curvature, texture, and lighting of the surface (cloth wrinkles, ceramic gloss, paper matte). 2. Use displacement maps logic to wrap the image realistically. 3. Match the white balance of the scene.",
        placeholder: "Tempel di mana?",
        quickPrompts: [
            "Di kaos putih kusut",
            "Di cangkir kopi keramik",
            "Di papan reklame kota",
            "Di layar macbook di meja"
        ]
      },
      { 
        id: 'banner', 
        label: 'Buat Banner', 
        icon: Icons.Banner, 
        systemPrompt: "ROLE: Marketing Graphic Designer. TASK: Extend the image composition to create negative space suitable for text overlay (Banner/Poster format). REQUIREMENTS: 1. Extend background seamlessly to 16:9 or user specified ratio. 2. Balance the composition so the subject is on one side. 3. Ensure the aesthetic is clean, professional, and eye-catching for advertising.",
        placeholder: "Tema banner untuk apa?",
        quickPrompts: [
            "Banner Promo Ramadhan 16:9",
            "Poster Festival Musik",
            "Header Konferensi Teknologi",
            "Latar Promo Minimalis"
        ]
      },
      { 
        id: 'carousel', 
        label: 'Buat Carousel', 
        icon: Icons.Cube, 
        systemPrompt: "ROLE: Instagram Carousel Designer & Brand Storyteller. TASK: Create a high-quality, continuous 4-slide carousel sequence for social media. REQUIREMENTS: 1. CONSISTENCY IS KING: You must strictly adhere to the same Color Palette, Typography Style, and Graphic Elements across all generated slides. 2. NARRATIVE FLOW: The slides should tell a story (e.g., Intro -> Problem -> Solution -> CTA) or break down a tutorial step-by-step. 3. LAYOUT: Ensure the visual balance is perfect for square (1:1) or portrait (4:5) viewing. Text must be legible. 4. AESTHETIC: Create a cohesive visual identity that looks like it belongs to the same brand.",
        placeholder: "Tema carousel? (misal: 4 Tips Sukses Bisnis)",
        allowMultiUpload: true, // Allow images as reference for style
        quickPrompts: [
            "Carousel edukasi pastel",
            "Carousel teknologi mode gelap",
            "Cerita perjalanan cerah",
            "Carousel bisnis bersih"
        ]
      },
      { 
        id: 'pov', 
        label: 'POV Tangan', 
        icon: Icons.Hand, 
        systemPrompt: "ROLE: First-Person Photographer. TASK: Re-imagine the scene from a First-Person Point of View (POV). REQUIREMENTS: 1. Generate realistic hands holding the object or interacting with the scene. 2. Match skin tone and lighting to the environment. 3. Ensure the angle implies the viewer is the one acting. 4. Use a slightly wider lens distortion for POV realism.",
        placeholder: "Sedang melakukan apa?",
        quickPrompts: [
            "Memegang cangkir kopi",
            "Mengetik di laptop",
            "Memegang iPhone",
            "Makan burger"
        ]
      }
    ]
  },
  {
    title: "Gaya Hidup",
    items: [
      { 
        id: 'prewed', 
        label: 'Pre Wedding', 
        icon: Icons.Heart, 
        systemPrompt: "ROLE: World-Class Wedding & Portrait Photographer. TASK: Create a high-end, cinematic couple portrait using the two input images. INPUT IDENTIFICATION: Image 1 is the GROOM (Male). Image 2 is the BRIDE (Female). REQUIREMENTS: 1. Professional Composition: Use Rule of Thirds, Golden Ratio, or symmetrical framing. 2. Lighting: Apply professional studio lighting (Rembrandt, Butterfly) or natural 'Golden Hour' lighting. 3. Skin & Texture: Retouch skin naturally (Frequency Separation style), maintaining realistic texture while removing blemishes. 4. Wardrobe: Harmonize the couple's attire to look like a coordinated professional photoshoot. 5. Environment: Generate a breathtaking, detailed background that matches the requested theme. 6. Identity: Strictly preserve the facial features and identity of both subjects. VIBE: Romantic, High-Fashion, Luxury, Professional.",
        placeholder: "Lokasi impian? (misal: Senja di Santorini)",
        allowMultiUpload: true, // Enable multi upload for Groom + Bride
        quickPrompts: [
            "Matahari terbenam Pantai Bali",
            "Romansa Menara Eiffel Paris",
            "Hutan Peri Ajaib",
            "Studio Hitam Putih Klasik",
            "Senja di Santorini Yunani",
            "Gaya Vintage Klasik Eropa",
            "Taman Bunga Sakura Jepang",
            "Kemewahan Hotel Bintang 5",
            "Padang Pasir Eksotis",
            "Nuansa Salju Musim Dingin"
        ]
      },
      { 
        id: 'fitting', 
        label: 'Kamar Pas', 
        icon: Icons.Fashion, 
        systemPrompt: "ROLE: Virtual Stylist. TASK: Change the outfit of the person in the photo. REQUIREMENTS: 1. The new clothes must fit the body shape and pose perfectly (fabric drape, folds). 2. Maintain the original head and background. 3. Realistic lighting on the new fabric textures.",
        placeholder: "Ganti baju jadi apa?",
        quickPrompts: [
            "Gaun malam merah elegan",
            "Setelan jas tuxedo hitam",
            "Kaos putih santai dan jeans",
            "Kemeja Batik Tradisional"
        ]
      },
      { 
        id: 'retouch', 
        label: 'Retouch', 
        icon: Icons.Edit, 
        systemPrompt: "ROLE: High-End Beauty Retoucher. TASK: Polish the subject's appearance. REQUIREMENTS: 1. Frequency Separation technique: smooth skin while keeping pores/texture. 2. Brighten eyes and whiten teeth naturally. 3. Remove stray hairs and blemishes. 4. Dodge and burn to contour the face subtly.",
        placeholder: "Bagian mana yang perlu diperbaiki?",
        quickPrompts: [
            "Haluskan kulit dan hapus jerawat",
            "Putihkan gigi cemerlang",
            "Hapus kantung mata",
            "Buat saya terlihat lebih muda"
        ]
      },
      { 
        id: 'model', 
        label: 'Foto Model', 
        icon: Icons.User, 
        systemPrompt: "ROLE: Modeling Scout/Director. TASK: Enhance the subject's posture and presence to look like a professional model. REQUIREMENTS: 1. Improve body language confidence. 2. Sharp, striking jawlines and features. 3. Clean, high-contrast fashion lighting.",
        placeholder: "Style model?",
        quickPrompts: [
            "Pose Model Runway",
            "Foto Profil CEO Percaya Diri",
            "Fisik Model Kebugaran",
            "Majalah High Fashion"
        ]
      },
      { 
        id: 'barber', 
        label: 'Barbershop', 
        icon: Icons.Scissor, 
        systemPrompt: "ROLE: Professional Barber/Hairstylist. TASK: Change the subject's hairstyle or beard. REQUIREMENTS: 1. Realistic hair rendering (strands, shine, volume). 2. Fit the new hair to the head shape and hairline naturally. 3. Match the hair color to the eyebrows/roots unless specified.",
        placeholder: "Model rambut baru?",
        quickPrompts: [
            "Potongan Fade Modern",
            "Rambut Bergelombang Panjang",
            "Botak dengan Jenggot",
            "Cat Rambut Abu-abu Perak"
        ]
      },
      { 
        id: 'baby', 
        label: 'Baby Born', 
        icon: Icons.Star, 
        systemPrompt: "ROLE: Newborn Photographer (Anne Geddes style). TASK: Transform the baby photo into a professional newborn session. REQUIREMENTS: 1. Props & Wrap: Gently swaddle the baby in soft blankets or place in a cozy basket/nest if fits the pose. 2. Atmosphere: Dreamy, soft, ethereal. 3. Lighting: Very soft, diffused natural window light. 4. Colors: Pastel tones (soft pink, blue, cream, mint).",
        placeholder: "Tema foto bayi?",
        quickPrompts: [
            "Tidur di keranjang rotan",
            "Kostum kelinci lucu",
            "Bedong kain lembut cream",
            "Tema bunga-bunga"
        ]
      },
      { 
        id: 'kids', 
        label: 'Kids', 
        icon: Icons.User, 
        systemPrompt: "ROLE: Child Portrait Photographer. TASK: Create a vibrant, professional child portrait. REQUIREMENTS: 1. Expression: Capture innocence and joy. 2. Focus: Sharp focus on the eyes, creamy bokeh background. 3. Lighting: Bright, cheerful high-key lighting. 4. Environment: Playful but aesthetic (park, studio with balloons, clean room).",
        placeholder: "Tema foto anak?",
        quickPrompts: [
            "Bermain di taman bunga",
            "Studio cerah dengan balon",
            "Pahlawan super kecil",
            "Potret candid tertawa"
        ]
      },
      { 
        id: 'haji', 
        label: 'Umrah / Haji', 
        icon: Icons.Moon, 
        systemPrompt: "ROLE: Religious Portrait Photographer. TASK: Transform the subject into a pilgrim performing Umrah or Hajj. REQUIREMENTS: 1. Attire: If male, wear white Ihram cloth. If female, wear modest white or black Islamic dress/hijab. 2. Background: The Holy Kaaba (Masjidil Haram) or Masjid Nabawi, blurred slightly for depth. 3. Lighting: Spiritual, bright, golden sunlight. 4. Vibe: Serene, holy, peaceful.",
        placeholder: "Lokasi di tanah suci?",
        quickPrompts: [
            "Di depan Ka'bah Mekkah",
            "Di Masjid Nabawi Madinah",
            "Berdoa dengan pakaian Ihram",
            "Suasana senja di Masjidil Haram"
        ]
      },
      { 
        id: 'pasfoto', 
        label: 'Pas Foto', 
        icon: Icons.Camera, 
        systemPrompt: "ROLE: Professional Studio Photographer. TASK: Create a formal ID Photo (Pas Foto). REQUIREMENTS: 1. Background: Solid RED or BLUE (based on user request) or plain White. 2. Attire: Formal business attire. Men: White shirt, black blazer/suit, tie (optional). Women: Formal blazer or modest formal blouse. 3. Pose: Straight front-facing, neutral expression, shoulders aligned. 4. Lighting: Flat, even studio lighting, no harsh shadows on face.",
        placeholder: "Warna background dan pakaian?",
        quickPrompts: [
            "Background Merah Kemeja Putih",
            "Background Biru Jas Hitam",
            "Background Merah Jas Formal",
            "Background Putih Visa"
        ]
      },
      { 
        id: 'maternity', 
        label: 'Maternity', 
        icon: Icons.Heart, 
        systemPrompt: "ROLE: Maternity Photographer. TASK: Create an elegant pregnancy portrait. REQUIREMENTS: 1. Focus: Highlight the baby bump (if visible) or the maternal glow. 2. Attire: Flowing, elegant maternity gown (silky, lace). 3. Atmosphere: Intimate, loving, soft. 4. Lighting: Rim lighting or soft silhouette to accentuate curves.",
        placeholder: "Tema maternity?",
        quickPrompts: [
            "Gaun panjang elegan di studio",
            "Silhouette jendela backlit",
            "Tema alam hutan peri",
            "Close-up perut artistik"
        ]
      }
    ]
  },
  {
    title: "Desain",
    items: [
      { 
        id: 'home', 
        label: 'Desain Rumah', 
        icon: Icons.Home, 
        systemPrompt: "ROLE: Interior Designer & 3D Visualizer. TASK: Redesign the interior space. REQUIREMENTS: 1. Photorealistic rendering (V-Ray/Corona style). 2. Accurate scale of furniture. 3. Perfect ambient occlusion and lighting. 4. Apply the requested style (Scandinavian, Industrial, Japandi) consistently.",
        placeholder: "Gaya interior?",
        quickPrompts: [
            "Interior Minimalis Modern",
            "Gaya Loteng Industrial",
            "Gaya Kayu Japandi",
            "Emas Klasik Mewah"
        ]
      },
      { 
        id: 'sketch', 
        label: 'Sketsa Gambar', 
        icon: Icons.Pencil, 
        systemPrompt: "ROLE: Traditional Artist. TASK: Convert the photo into a hand-drawn artwork. REQUIREMENTS: 1. Mimic traditional media textures (pencil graphite, charcoal dust, ink hatching). 2. Focus on line weight and shading. 3. Abstract the details into artistic strokes.",
        placeholder: "Jenis sketsa?",
        quickPrompts: [
            "Sketsa Pensil di Kertas",
            "Gambar Arang",
            "Tinta Biru Arsitektural",
            "Lukisan Cat Air"
        ]
      },
      { 
        id: 'art', 
        label: 'Art & Karikatur', 
        icon: Icons.Artist, 
        systemPrompt: "ROLE: Digital Illustrator. TASK: Transform the image into a specific stylized art form. REQUIREMENTS: 1. Strong stylization (e.g., exaggerated features for caricature, brush strokes for oil painting). 2. Vibrant colors. 3. Creative interpretation of the subject.",
        placeholder: "Gaya seni?",
        quickPrompts: [
            "Karikatur Lucu",
            "Gaya Starry Night Van Gogh",
            "Anime Studio Ghibli",
            "Karakter 3D Pixar"
        ]
      },
      { 
        id: 'tidy', 
        label: 'Auto Rapi', 
        icon: Icons.Edit, 
        systemPrompt: "ROLE: Professional Organizer (Marie Kondo style). TASK: Declutter the scene. REQUIREMENTS: 1. Identify and remove trash, clutter, and messy cables. 2. Straighten objects (books, frames). 3. Fill the empty spaces with clean, neutral surfaces. 4. Make the room look organized and spacious.",
        placeholder: "Apa yang perlu dirapikan?",
        quickPrompts: [
            "Hapus semua sampah",
            "Bersihkan meja berantakan",
            "Rapikan rak buku",
            "Rapikan tempat tidur"
        ]
      },
      { 
        id: 'logo', 
        label: 'Buat Logo', 
        icon: Icons.Cube, 
        systemPrompt: "ROLE: Vector Logo Designer. TASK: Distill the essence of the image into a minimal logo mark. REQUIREMENTS: 1. Flat design, vector aesthetic. 2. Limited color palette (max 3 colors). 3. Clean geometric shapes. 4. Negative space utilization.",
        placeholder: "Nama brand atau gaya logo?",
        quickPrompts: [
            "Logo Garis Minimalis",
            "Logo Startup Teknologi Biru",
            "Logo Hijau Organik",
            "Logo Lencana Vintage"
        ]
      },
      { 
        id: 'mascot', // RENAMED FROM 'mascot' in types or ensuring ID matches for new feature logic
        label: 'Buat Maskot', 
        icon: Icons.User, 
        systemPrompt: "ROLE: 3D Character Designer & Brand Mascot Expert. TASK: Create a high-quality, distinctive mascot character based on user input and optional reference image. REQUIREMENTS: 1. STYLE: Strictly adhere to the requested style (Hewan/Animal, Manusia/Human, Kartun/Cartoon, 3D, Chibi). 2. BRANDING: Incorporate the requested BRAND COLORS dominantly in the clothing or character features. 3. QUALITY: Ensure the character is expressive, friendly, and suitable for commercial use (clean lines, good lighting). 4. If reference image is provided, use it as inspiration for the pose or base appearance. If not, generate from scratch based on description.",
        placeholder: "Deskripsikan karakter (misal: singa ramah minum kopi)...",
        quickPrompts: [
            "Maskot Robot Lucu",
            "Maskot Hewan Berbulu",
            "Pahlawan Super Mini",
            "Manusia Gaya Pixar"
        ]
      }
    ]
  }
];