'use client';

import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getAiChatResponse, type AiChatInput, type AiChatOutput } from '@/ai/flows/ai-chat';
import MobileNav from '@/components/mobile-nav';
import { Brain, Bot, Palette, Zap, BookOpen, Lightbulb, Target, Users, Eye, Play, CheckCircle } from 'lucide-react';
import { errorLogger } from '@/lib/error-logger';

// Gemini AI 3D model type definitions
interface GeminiModelData {
  geometry?: GeminiGeometry;
  materials?: GeminiMaterial[];
  assets?: GeminiComponent[];
  components?: GeminiComponent[];
  lights?: GeminiLight[];
  camera?: {
    position?: number[];
    lookAt?: number[];
    fov?: number;
  };
}

interface GeminiComponent {
  geometry: GeminiGeometry;
  material: GeminiMaterial;
  position?: number[];
  rotation?: number[];
  scale?: number[];
  animation?: {
    type: 'rotation' | 'pulse' | 'orbit' | 'wave';
    speed?: number;
    amplitude?: number;
  };
}

interface GeminiGeometry {
  type: string;
  parameters?: Record<string, unknown>;
  radius?: number;
  segments?: number;
  dimensions?: number[];
}

interface GeminiMaterial {
  type: string;
  color?: string | number;
  opacity?: number;
  transparent?: boolean;
  metalness?: number;
  roughness?: number;
}

interface GeminiMaterialOptions {
  color?: string | number;
  opacity?: number;
  transparent?: boolean;
  metalness?: number;
  roughness?: number;
}

interface GeminiLight {
  type: string;
  color?: string | number;
  intensity?: number;
  position?: number[];
  distance?: number;
  angle?: number;
  penumbra?: number;
}

interface GeminiLightOptions {
  color?: string | number;
  intensity?: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
}

export default function AI3DEducationPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiChatOutput | null>(null);
  const [subject, setSubject] = useState('Genel');
  const [complexity, setComplexity] = useState<'Basit' | 'Orta' | 'Karmaşık'>('Orta');

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Three.js scene kurulumu
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) {return;}

    // Scene kurulumu
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    currentMount.appendChild(renderer.domElement);

    // Işıklandırma
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Kontroller
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Referansları sakla
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // AI Chat flow ile 3D model üretimi
  const generate3DModel = async () => {
    if (!prompt.trim()) {return;}

    setIsGenerating(true);

    try {
                           // Gemini API'ye özel prompt engineering - AŞIRI AGRESIF
        const geminiPrompt = `SEN BİR 3D SİMÜLASYON UZMANISIN. "${prompt.trim()}" İÇİN DETAYLI 3D SAHNE VERİSİ ÜRET.

              ⚠️ ÇOK ÖNEMLİ KURALLAR ⚠️:
              🚫 SADECE JSON YAZ. HİÇBİR AÇIKLAMA, YORUM VEYA EK METİN YAZMA.
              🚫 SADECE { İLE BAŞLA VE } İLE BİTİR. BU KURALI ÇİĞNERSEN SİSTEM ÇÖKER.
              🚫 MARKDOWN CODE BLOCK KULLANMA. SADECE DÜZ JSON.
              🚫 "ELBETTE" "İşte" "Bu JSON verisi" GİBİ CÜMLELER YAZMA.
              🚫 SADECE JSON OBJEKTİ YAZ, BAŞKA HİÇBİR ŞEY YAZMA.
              
              ŞU FORMATTA JSON RESPONSE VER:
             {
               "description": "Modelin kısa açıklaması.",
               "scientificAccuracy": "Yüksek|Orta|Düşük",
               "camera": {
                 "position": [x, y, z],
                 "lookAt": [x, y, z] // Kameranın nereye bakacağı
               },
               "environment": "uzay|laboratuvar|doğal|yok", // Sahne arka planı için
               "lights": [ // Sahne ışıkları
                 { "type": "ambient", "color": "#ffffff", "intensity": 0.5 },
                 { "type": "directional", "color": "#ffffff", "intensity": 1, "position": [5, 10, 7] }
               ],
               "assets": [
                 {
                   "name": "string", // Nesnenin adı
                   "modelUrl": "https://example.com/model.glb", // (ÖNCELİKLİ) Karmaşık model için .glb/.gltf URL'si
                   "geometry": { ... }, // modelUrl yoksa, basit geometri için
                   "material": {
                     "type": "standard", // MeshStandardMaterial daha gerçekçi
                     "color": "#ff0000",
                     "mapUrl": "https://example.com/texture.jpg", // Doku (texture) haritası
                     "normalMapUrl": "https://example.com/normal.jpg", // Detay hissi veren normal haritası
                     "roughness": 0.5, // Pürüzlülük (0=ayna, 1=mat)
                     "metalness": 0.1 // Metaliklik (0=dielektrik, 1=metal)
                   },
                   "position": [x, y, z],
                   "rotation": [x, y, z],
                   "scale": [x, y, z],
                   "animation": { // Basit animasyonlar
                     "type": "rotation|pulse|orbit|wave"
                   },
                   "physics": { // Fizik motoru için
                     "type": "dynamic|fixed", // Hareketli mi, sabit mi?
                     "shape": "cuboid|ball|trimesh", // Fiziksel şekil
                     "mass": 1, // Kütle
                     "restitution": 0.5 // Sekme katsayısı
                   }
                 }
               ]
             }
             
             Konu: ${subject}, Karmaşıklık: ${complexity}. Bilimsel olarak doğru ve görsel olarak zengin bir sahne oluştur. Eğer konu için uygun bir .glb modeli varsa (örneğin 'insan kalbi' için bir kalp modeli), modelUrl kullan. Yoksa 'components' ile oluştur.
             
             🔥 SON UYARI: SADECE JSON YAZ! 🔥`;

      const input: AiChatInput = {
        message: geminiPrompt,
        subject,
        conversationHistory: [],
        context: `3D model üretimi: ${prompt.trim()}, Karmaşıklık: ${complexity}, Gemini API ile gerçek zamanlı üretim`,
      };

      const response = await getAiChatResponse(input);
      setAiResponse(response);

      // Gemini response'dan 3D model oluştur
      if (sceneRef.current && response) {
        create3DModelFromGemini(prompt, response);
      }

    } catch (error) {
      // Hata durumunda basit bir model oluştur
      errorLogger.logError('AI generation error', error);
      createSample3DModel(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

   // Tüm modelleri temizleme fonksiyonu
   const clearAllModels = () => {
     if (!sceneRef.current) {return;}

     // Scene'deki tüm çocukları kontrol et
     const childrenToRemove: THREE.Object3D[] = [];

     sceneRef.current.children.forEach((child) => {
       // Sadece ışıkları koru, diğer her şeyi kaldır
       if (child.type !== 'AmbientLight' &&
           child.type !== 'DirectionalLight' &&
           child.type !== 'PointLight' &&
           child.type !== 'SpotLight') {
         childrenToRemove.push(child);
       }
     });

     // Modelleri kaldır
     childrenToRemove.forEach((child) => {
       // Animasyon loop'larını durdur
       if (child.userData?.animationLoop) {
         cancelAnimationFrame(child.userData.animationLoop);
       }

       // Group içindeki tüm çocukları da kontrol et
       if (child.type === 'Group') {
         child.children.forEach((groupChild) => {
           if (groupChild.userData?.animationLoop) {
             cancelAnimationFrame(groupChild.userData.animationLoop);
           }
         });
       }

       // Geometri ve materyalleri dispose et
       if (child.type === 'Mesh') {
         const mesh = child as THREE.Mesh;
         if (mesh.geometry) {
           mesh.geometry.dispose();
         }
         if (mesh.material) {
           if (Array.isArray(mesh.material)) {
             mesh.material.forEach(mat => mat.dispose());
           } else {
             mesh.material.dispose();
           }
         }
       }

       // Scene'den kaldır
       sceneRef.current!.remove(child);
     });

    };

  // Gemini response'dan 3D model oluşturma
  const create3DModelFromGemini = (modelPrompt: string, aiData: AiChatOutput) => {
     if (!sceneRef.current) {return;}

     // Tüm önceki modelleri temizle (sadece ışıkları koru)
     clearAllModels();

    try {
      // Gemini response'u parse et
      const geminiResponse = aiData.response;
      let modelData;

             // JSON formatında response var mı kontrol et

       if (geminiResponse.includes('{') && geminiResponse.includes('}')) {
         // Markdown code blocks'ları temizle
         let cleanResponse = geminiResponse;

         // ```json ve ``` bloklarını kaldır
         if (cleanResponse.includes('```json')) {
           cleanResponse = cleanResponse.replace(/```json\s*/g, '');
         }
         if (cleanResponse.includes('```')) {
           cleanResponse = cleanResponse.replace(/```/g, '');
         }

         // JSON başlangıç ve bitiş noktalarını bul
         const jsonStart = cleanResponse.indexOf('{');
         const jsonEnd = cleanResponse.lastIndexOf('}') + 1;

         if (jsonStart !== -1 && jsonEnd > jsonStart) {
           const jsonString = cleanResponse.substring(jsonStart, jsonEnd);

           try {
             modelData = JSON.parse(jsonString);
            } catch (parseError) {
               errorLogger.logError('JSON parsing error', parseError);
               modelData = null;
           }
         } else {
            modelData = null;
         }
       } else {
          modelData = null;
       }

             // Gemini'den gelen veri ile model oluştur (assets veya components varsa)
       if (modelData && (modelData.assets || modelData.components || modelData.geometry)) {
              createGeminiModel(modelData);
       } else {
         // Fallback: Prompt'a göre basit model
          const promptLower = modelPrompt.toLowerCase();
        if (promptLower.includes('dna') || promptLower.includes('genetik')) {
          createDNAModel();
        } else if (promptLower.includes('atom') || promptLower.includes('molekül') || promptLower.includes('kimyasal')) {
          createAtomModel();
        } else if (promptLower.includes('hücre') || promptLower.includes('cell') || promptLower.includes('organel')) {
          createCellModel();
        } else if (promptLower.includes('kalp') || promptLower.includes('heart') || promptLower.includes('kardiyak')) {
          createHeartModel();
        } else if (promptLower.includes('beyin') || promptLower.includes('brain') || promptLower.includes('sinir')) {
          createBrainModel();
        } else if (promptLower.includes('iskelet') || promptLower.includes('kemik') || promptLower.includes('skeleton')) {
          createSkeletonModel();
        } else if (promptLower.includes('kas') || promptLower.includes('muscle') || promptLower.includes('kas sistemi')) {
          createMuscleModel();
        } else if (promptLower.includes('mitokondri') || promptLower.includes('mitochondria') || promptLower.includes('enerji')) {
          createMitochondriaModel();
        } else {
          // Varsayılan olarak prompt'a göre özel model
          createCustomModel(modelPrompt, aiData);
        }
      }
    } catch (error) {
      errorLogger.logError('3D model creation error', error);
      createSample3DModel(modelPrompt);
    }
  };

  // Gemini'den gelen veri ile 3D model oluşturma
  const createGeminiModel = (modelData: GeminiModelData) => {
    if (!sceneRef.current) {return;}

    const geminiGroup = new THREE.Group();

    // Ana model geometrisi
    if (modelData.geometry) {
      const geometry = createGeometryFromGemini(modelData.geometry);
      const material = createMaterialFromGemini(modelData.materials?.[0] || { type: 'standard' });

      if (geometry && material) {
        const mainMesh = new THREE.Mesh(geometry, material);
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        geminiGroup.add(mainMesh);
      }
    }

    // Bileşenler (assets veya components)
    const components = modelData.assets || modelData.components;
    if (components && Array.isArray(components)) {
      components.forEach((component: GeminiComponent) => {
        const compGeometry = createGeometryFromGemini(component.geometry);
        const compMaterial = createMaterialFromGemini(component.material);

        if (compGeometry && compMaterial) {
          const compMesh = new THREE.Mesh(compGeometry, compMaterial);

          // Pozisyon, rotasyon, ölçek
                     if (component.position && Array.isArray(component.position) && component.position.length >= 3) {
             compMesh.position.set(
               component.position[0] ?? 0,
               component.position[1] ?? 0,
               component.position[2] ?? 0,
             );
           }
                     if (component.rotation && Array.isArray(component.rotation) && component.rotation.length >= 3) {
             compMesh.rotation.set(
               component.rotation[0] ?? 0,
               component.rotation[1] ?? 0,
               component.rotation[2] ?? 0,
             );
           }
                     if (component.scale && Array.isArray(component.scale) && component.scale.length >= 3) {
             compMesh.scale.set(
               component.scale[0] ?? 1,
               component.scale[1] ?? 1,
               component.scale[2] ?? 1,
             );
           }

          // Animasyon verisi
          if (component.animation) {
            compMesh.userData.animation = component.animation;
          }

          compMesh.castShadow = true;
          geminiGroup.add(compMesh);
        }
      });
    }

    // Işıklar
    if (modelData.lights && Array.isArray(modelData.lights)) {
      modelData.lights.forEach((lightData: GeminiLight) => {
        const light = createLightFromGemini(lightData);
        if (light) {
          geminiGroup.add(light);
        }
      });
    }

    // Kamera ayarları
    if (modelData.camera && cameraRef.current) {
             if (modelData.camera.position && Array.isArray(modelData.camera.position) && modelData.camera.position.length >= 3) {
         cameraRef.current.position.set(
           modelData.camera.position[0] as number,
           modelData.camera.position[1] as number,
           modelData.camera.position[2] as number,
         );
       }
             if (modelData.camera.lookAt && Array.isArray(modelData.camera.lookAt) && modelData.camera.lookAt.length >= 3) {
         cameraRef.current.lookAt(
           modelData.camera.lookAt[0] as number,
           modelData.camera.lookAt[1] as number,
           modelData.camera.lookAt[2] as number,
         );
       }
      if (modelData.camera.fov) {
        cameraRef.current.fov = modelData.camera.fov;
        cameraRef.current.updateProjectionMatrix();
      }
    }

    // Eğer hiçbir mesh eklenmemişse, varsayılan bir küp ekle
    if (geminiGroup.children.length === 0) {
      const defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
      const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
      const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
      defaultMesh.castShadow = true;
      defaultMesh.receiveShadow = true;
      geminiGroup.add(defaultMesh);
    }

    // Scene'e ekle
    sceneRef.current.add(geminiGroup);

    // Animasyon loop'u ekle
    const animateGemini = () => {
      geminiGroup.children.forEach((child) => {
        if (child.type === 'Mesh' && child.userData.animation) {
          const anim = child.userData.animation;

          switch (anim.type) {
            case 'rotation':
              child.rotation.y += anim.speed || 0.01;
              break;
            case 'pulse':
              const pulse = 1 + Math.sin(Date.now() * 0.001) * (anim.amplitude || 0.1);
              child.scale.setScalar(pulse);
              break;
            case 'orbit':
              const time = Date.now() * 0.001 * (anim.speed || 1);
              const radius = anim.amplitude || 2;
              child.position.x = Math.cos(time) * radius;
              child.position.z = Math.sin(time) * radius;
              break;
            case 'wave':
              const wave = Math.sin(Date.now() * 0.001 + child.position.y) * (anim.amplitude || 0.1);
              child.position.y += wave * 0.01;
              break;
          }
        }
      });
      requestAnimationFrame(animateGemini);
    };
    animateGemini();
  };

  // Gemini geometry verisinden Three.js geometry oluşturma
  const createGeometryFromGemini = (geoData: GeminiGeometry | null | undefined): THREE.BufferGeometry | null => {
    if (!geoData?.type) {return null;}

    switch (geoData.type.toLowerCase()) {
      case 'sphere':
        return new THREE.SphereGeometry(
          geoData.radius || 1,
          geoData.segments || 32,
          geoData.segments || 16,
        );
      case 'box':
        return new THREE.BoxGeometry(
          geoData.dimensions?.[0] || 1,
          geoData.dimensions?.[1] || 1,
          geoData.dimensions?.[2] || 1,
        );
      case 'cylinder':
        return new THREE.CylinderGeometry(
          geoData.radius || 1,
          geoData.radius || 1,
          geoData.dimensions?.[1] || 2,
          geoData.segments || 32,
        );
      case 'torus':
        return new THREE.TorusGeometry(
          geoData.radius || 1,
          geoData.dimensions?.[0] || 0.3,
          geoData.segments || 16,
          geoData.segments || 100,
        );
      case 'capsule':
        return new THREE.CapsuleGeometry(
          geoData.radius || 0.5,
          geoData.dimensions?.[1] || 1,
          geoData.segments || 4,
          geoData.segments || 8,
        );
      default:
        return new THREE.SphereGeometry(1);
    }
  };

  // Gemini material verisinden Three.js material oluşturma
  const createMaterialFromGemini = (matData: GeminiMaterial | null | undefined): THREE.Material => {
    if (!matData) {return new THREE.MeshPhongMaterial({ color: 0x888888 });}

    // Hex string'i hex number'a çevir
    let color = 0x888888;
    if (matData.color) {
      if (typeof matData.color === 'string' && matData.color.startsWith('#')) {
        color = parseInt(matData.color.replace('#', ''), 16);
      } else if (typeof matData.color === 'number') {
        color = matData.color;
      }
    }

    const materialOptions: GeminiMaterialOptions = {
      color,
      transparent: matData.transparent || false,
      opacity: matData.opacity || 1.0,
      roughness: matData.roughness || 0.5,
      metalness: matData.metalness || 0.0,
    };

    switch (matData.type?.toLowerCase()) {
      case 'basic':
        return new THREE.MeshBasicMaterial(materialOptions);
      case 'emissive':
        return new THREE.MeshPhongMaterial({
          ...materialOptions,
          emissive: materialOptions.color || 0x888888,
          emissiveIntensity: 0.5,
        });
      case 'standard':
      case 'phong':
      default:
        return new THREE.MeshPhongMaterial(materialOptions);
    }
  };

  // Gemini light verisinden Three.js light oluşturma
  const createLightFromGemini = (lightData: GeminiLight | null | undefined): THREE.Light | null => {
    if (!lightData?.type) {return null;}

    // Hex string'i hex number'a çevir
    let color = 0xffffff;
    if (lightData.color) {
      if (typeof lightData.color === 'string' && lightData.color.startsWith('#')) {
        color = parseInt(lightData.color.replace('#', ''), 16);
      } else if (typeof lightData.color === 'number') {
        color = lightData.color;
      }
    }

    const lightOptions: GeminiLightOptions = {
      color,
      intensity: lightData.intensity || 1.0,
    };

    switch (lightData.type.toLowerCase()) {
      case 'ambient':
        return new THREE.AmbientLight(lightOptions.color, lightOptions.intensity);
      case 'directional':
        const dirLight = new THREE.DirectionalLight(lightOptions.color, lightOptions.intensity);
                 if (lightData.position && Array.isArray(lightData.position) && lightData.position.length >= 3) {
           dirLight.position.set(
             lightData.position[0] ?? 0,
             lightData.position[1] ?? 0,
             lightData.position[2] ?? 0,
           );
         }
        return dirLight;
      case 'point':
        const pointLight = new THREE.PointLight(lightOptions.color, lightOptions.intensity);
                 if (lightData.position && Array.isArray(lightData.position) && lightData.position.length >= 3) {
           pointLight.position.set(
             lightData.position[0] ?? 0,
             lightData.position[1] ?? 0,
             lightData.position[2] ?? 0,
           );
         }
        return pointLight;
      default:
        return new THREE.AmbientLight(0x404040, 0.6);
    }
  };

  // DNA modeli oluşturma
  const createDNAModel = () => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    // Gemini AI ile gerçek DNA sarmalı oluştur
    const dnaGroup = new THREE.Group();

    // Ana sarmal yapısı - çift sarmal
    for (let i = 0; i < 100; i++) {
      const angle = i * 0.2;
      const radius = 0.8;
      const height = i * 0.05;

      // İlk sarmal (Adenin-Thymine)
      const base1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshPhongMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.9,
        }),
      );
      base1.position.set(
        Math.cos(angle) * radius,
        height - 2.5,
        Math.sin(angle) * radius,
      );
      base1.castShadow = true;
      dnaGroup.add(base1);

      // İkinci sarmal (Guanine-Cytosine) - karşı tarafta
      const base2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshPhongMaterial({
          color: 0xff0088,
          transparent: true,
          opacity: 0.9,
        }),
      );
      base2.position.set(
        Math.cos(angle + Math.PI) * radius,
        height - 2.5,
        Math.sin(angle + Math.PI) * radius,
      );
      base2.castShadow = true;
      dnaGroup.add(base2);

      // Base pair bağlantıları
      if (i % 5 === 0) {
        const connection = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.6),
          new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7,
          }),
        );
        connection.position.set(0, height - 2.5, 0);
        connection.castShadow = true;
        dnaGroup.add(connection);
      }
    }

    // Sarmal ekseni
    const axis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 5),
      new THREE.MeshPhongMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5,
      }),
    );
    axis.position.set(0, 0, 0);
    axis.castShadow = true;
    dnaGroup.add(axis);

    // Animasyon için referans sakla
    dnaGroup.userData = {
      rotationSpeed: 0.01,
      baseRotation: 0,
      waveOffset: 0,
    };

    sceneRef.current.add(dnaGroup);

    // Animasyon loop'u ekle
    const animateDNA = () => {
      if (dnaGroup.userData) {
        // Sarmal dönüşü
        dnaGroup.rotation.y += dnaGroup.userData.rotationSpeed;

        // Base'lerde dalga efekti
        dnaGroup.children.forEach((child, index) => {
          if (child.type === 'Mesh') {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry.type === 'Sphere') {
              const wave = Math.sin(Date.now() * 0.001 + index * 0.1) * 0.1;
              mesh.scale.setScalar(1 + wave);
            }
          }
        });
      }
      requestAnimationFrame(animateDNA);
    };
    animateDNA();
  };

  // Atom modeli oluşturma
  const createAtomModel = () => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    const atomGroup = new THREE.Group();

    // Çekirdek
    const nucleusGeometry = new THREE.SphereGeometry(0.5);
    const nucleusMaterial = new THREE.MeshPhongMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.8,
    });

    const nucleusMesh = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleusMesh.castShadow = true;
    nucleusMesh.receiveShadow = true;
    atomGroup.add(nucleusMesh);

    // Proton ve nötronlar
    for (let i = 0; i < 20; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshPhongMaterial({
          color: Math.random() > 0.5 ? 0xff0088 : 0x00ff88,
          transparent: true,
          opacity: 0.9,
        }),
      );
      particle.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
      );
      atomGroup.add(particle);
    }

    // Elektron yörüngeleri ve elektronlar
    for (let i = 0; i < 3; i++) {
      const orbitRadius = 1.5 + i * 0.8;
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(orbitRadius, 0.02, 8, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.6,
        }),
      );
      orbit.rotation.x = Math.PI / 2;
      atomGroup.add(orbit);

      // Elektron
      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshPhongMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 0.5,
        }),
      );
      electron.userData = {
        orbitRadius,
        speed: 0.02 + i * 0.01,
        angle: Math.random() * Math.PI * 2,
      };
      atomGroup.add(electron);
    }

    // Animasyon için referans sakla
    atomGroup.userData = {
      rotationSpeed: 0.005,
      nucleusPulse: 0,
    };

    sceneRef.current.add(atomGroup);

    // Animasyon loop'u ekle
    const animateAtom = () => {
      if (atomGroup.userData) {
        // Çekirdek nabız efekti
        atomGroup.userData.nucleusPulse += 0.05;
        const pulse = 1 + Math.sin(atomGroup.userData.nucleusPulse) * 0.1;
        nucleusMesh.scale.setScalar(pulse);

        // Elektronların yörünge hareketi
        atomGroup.children.forEach((child) => {
          if (child.type === 'Mesh' && child.userData.orbitRadius) {
            const electron = child as THREE.Mesh;
            electron.userData.angle += electron.userData.speed;
            electron.position.x = Math.cos(electron.userData.angle) * electron.userData.orbitRadius;
            electron.position.z = Math.sin(electron.userData.angle) * electron.userData.orbitRadius;
            electron.position.y = 0;
          }
        });

        // Genel dönüş
        atomGroup.rotation.y += atomGroup.userData.rotationSpeed;
      }
      requestAnimationFrame(animateAtom);
    };
    animateAtom();
  };

  // Hücre modeli oluşturma
  const createCellModel = () => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    const cellGroup = new THREE.Group();

    // Ana hücre zarı
    const cellGeometry = new THREE.SphereGeometry(1.2);
    const cellMaterial = new THREE.MeshPhongMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    cellMesh.castShadow = true;
    cellMesh.receiveShadow = true;
    cellGroup.add(cellMesh);

    // Hücre içi sıvı (cytoplasm)
    const cytoplasmGeometry = new THREE.SphereGeometry(1.1);
    const cytoplasmMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.2,
    });

    const cytoplasmMesh = new THREE.Mesh(cytoplasmGeometry, cytoplasmMaterial);
    cytoplasmMesh.castShadow = true;
    cellGroup.add(cytoplasmMesh);

    // Çekirdek (nucleus)
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.4),
      new THREE.MeshPhongMaterial({
        color: 0xff0088,
        transparent: true,
        opacity: 0.8,
      }),
    );
    nucleus.position.set(0.3, 0.2, 0.1);
    nucleus.castShadow = true;
    nucleus.userData = { pulse: 0 };
    cellGroup.add(nucleus);

    // Çekirdek zarı
    const nucleusMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(0.42),
      new THREE.MeshPhongMaterial({
        color: 0xff4488,
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      }),
    );
    nucleusMembrane.position.copy(nucleus.position);
    cellGroup.add(nucleusMembrane);

    // Mitokondri
    for (let i = 0; i < 8; i++) {
      const mitochondria = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.08, 0.2, 4, 8),
        new THREE.MeshPhongMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.8,
        }),
      );
      mitochondria.position.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
      );
      mitochondria.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      mitochondria.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulse: Math.random() * Math.PI * 2,
      };
      cellGroup.add(mitochondria);
    }

    // Endoplazmik retikulum
    for (let i = 0; i < 15; i++) {
      const er = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshPhongMaterial({
          color: 0x8888ff,
          transparent: true,
          opacity: 0.7,
        }),
      );
      er.position.set(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
      );
      er.userData = {
        pulse: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4,
      };
      cellGroup.add(er);
    }

    // Golgi aparatı
    const golgi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
      new THREE.MeshPhongMaterial({
        color: 0xff88ff,
        transparent: true,
        opacity: 0.8,
      }),
    );
    golgi.position.set(-0.4, -0.3, 0.2);
    golgi.rotation.x = Math.PI / 2;
    golgi.userData = { pulse: 0 };
    cellGroup.add(golgi);

    // Ribozomlar
    for (let i = 0; i < 25; i++) {
      const ribosome = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.3,
        }),
      );
      ribosome.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      ribosome.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      cellGroup.add(ribosome);
    }

    // Animasyon için referans sakla
    cellGroup.userData = {
      rotationSpeed: 0.003,
      cellPulse: 0,
    };

    sceneRef.current.add(cellGroup);

    // Animasyon loop'u ekle
    const animateCell = () => {
      if (cellGroup.userData) {
        // Hücre zarı nabız efekti
        cellGroup.userData.cellPulse += 0.03;
        const cellPulse = 1 + Math.sin(cellGroup.userData.cellPulse) * 0.05;
        cellMesh.scale.setScalar(cellPulse);

        // Çekirdek nabız efekti
        nucleus.userData.pulse += 0.04;
        const nucleusPulse = 1 + Math.sin(nucleus.userData.pulse) * 0.1;
        nucleus.scale.setScalar(nucleusPulse);

        // Mitokondri animasyonları
        cellGroup.children.forEach((child) => {
          if (child.userData.rotationSpeed) {
            child.rotation.y += child.userData.rotationSpeed;
            child.userData.pulse += 0.05;
            const pulse = 1 + Math.sin(child.userData.pulse) * 0.2;
            child.scale.setScalar(pulse);
          }

          // ER animasyonları
          if (child.userData.pulse && child.userData.scale) {
            child.userData.pulse += 0.03;
            const erPulse = child.userData.scale + Math.sin(child.userData.pulse) * 0.1;
            child.scale.setScalar(erPulse);
          }

          // Golgi animasyonu
          if (child === golgi) {
            golgi.userData.pulse += 0.06;
            const golgiPulse = 1 + Math.sin(golgi.userData.pulse) * 0.15;
            golgi.scale.setScalar(golgiPulse);
          }

          // Ribozom yanıp sönme efekti
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        cellGroup.rotation.y += cellGroup.userData.rotationSpeed;
      }
      requestAnimationFrame(animateCell);
    };
    animateCell();
  };

  // Kalp modeli oluşturma
  const createHeartModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const heartGroup = new THREE.Group();

    // Ana kalp şekli (basitleştirilmiş)
    const heartGeometry = new THREE.SphereGeometry(1, 32, 16);
    const heartMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.castShadow = true;
    heartMesh.receiveShadow = true;
    heartGroup.add(heartMesh);

    // Kalp odacıkları
    const leftVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.6),
      new THREE.MeshPhongMaterial({
        color: 0xcc0000,
        transparent: true,
        opacity: 0.9,
      }),
    );
    leftVentricle.position.set(-0.3, -0.2, 0);
    leftVentricle.castShadow = true;
    heartGroup.add(leftVentricle);

    const rightVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshPhongMaterial({
        color: 0xaa0000,
        transparent: true,
        opacity: 0.9,
      }),
    );
    rightVentricle.position.set(0.3, -0.1, 0);
    rightVentricle.castShadow = true;
    heartGroup.add(rightVentricle);

    // Atardamarlar
    const aorta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.8,
      }),
    );
    aorta.position.set(0, 0.8, 0);
    aorta.rotation.x = Math.PI / 2;
    aorta.castShadow = true;
    heartGroup.add(aorta);

    // Kalp atışı animasyonu için referans sakla
    heartGroup.userData = {
      pulse: 0,
      rotationSpeed: 0.002,
    };

    sceneRef.current.add(heartGroup);

    // Animasyon loop'u ekle
    const animateHeart = () => {
      if (heartGroup.userData) {
        // Kalp atışı nabız efekti
        heartGroup.userData.pulse += 0.08;
        const pulse = 1 + Math.sin(heartGroup.userData.pulse) * 0.15;
        heartMesh.scale.setScalar(pulse);

        // Odacıklar da nabız efekti
        leftVentricle.scale.setScalar(pulse * 0.9);
        rightVentricle.scale.setScalar(pulse * 0.85);

        // Genel dönüş
        heartGroup.rotation.y += heartGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateHeart);
      heartGroup.userData.animationLoop = animationId;
    };
    animateHeart();
  };

  // Beyin modeli oluşturma
  const createBrainModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const brainGroup = new THREE.Group();

    // Ana beyin şekli
    const brainGeometry = new THREE.SphereGeometry(1.2, 32, 16);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa88,
      transparent: true,
      opacity: 0.8,
    });

    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainMesh.castShadow = true;
    brainMesh.receiveShadow = true;
    brainGroup.add(brainMesh);

    // Beyin yarıküreleri
    const leftHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.8),
      new THREE.MeshPhongMaterial({
        color: 0xff9988,
        transparent: true,
        opacity: 0.9,
      }),
    );
    leftHemisphere.position.set(-0.4, 0, 0);
    leftHemisphere.castShadow = true;
    brainGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.8),
      new THREE.MeshPhongMaterial({
        color: 0xff9988,
        transparent: true,
        opacity: 0.9,
      }),
    );
    rightHemisphere.position.set(0.4, 0, 0);
    rightHemisphere.castShadow = true;
    brainGroup.add(rightHemisphere);

    // Beyin sapı
    const brainStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.8, 8),
      new THREE.MeshPhongMaterial({
        color: 0xcc9988,
        transparent: true,
        opacity: 0.8,
      }),
    );
    brainStem.position.set(0, -1, 0);
    brainStem.castShadow = true;
    brainGroup.add(brainStem);

    // Nöronlar (parçacık sistemi)
    for (let i = 0; i < 30; i++) {
      const neuron = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 0.5,
        }),
      );
      neuron.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      neuron.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      brainGroup.add(neuron);
    }

    // Animasyon için referans sakla
    brainGroup.userData = {
      pulse: 0,
      rotationSpeed: 0.003,
    };

    sceneRef.current.add(brainGroup);

    // Animasyon loop'u ekle
    const animateBrain = () => {
      if (brainGroup.userData) {
        // Beyin nabız efekti
        brainGroup.userData.pulse += 0.04;
        const pulse = 1 + Math.sin(brainGroup.userData.pulse) * 0.08;
        brainMesh.scale.setScalar(pulse);

        // Nöron yanıp sönme efekti
        brainGroup.children.forEach((child) => {
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        brainGroup.rotation.y += brainGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateBrain);
      brainGroup.userData.animationLoop = animationId;
    };
    animateBrain();
  };

  // İskelet modeli oluşturma
  const createSkeletonModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const skeletonGroup = new THREE.Group();

    // Kafatası
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.6),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.9,
      }),
    );
    skull.castShadow = true;
    skeletonGroup.add(skull);

    // Omurga
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    spine.position.set(0, -1.5, 0);
    spine.castShadow = true;
    skeletonGroup.add(spine);

    // Kaburgalar
    for (let i = 0; i < 6; i++) {
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.05, 8, 16),
        new THREE.MeshPhongMaterial({
          color: 0xf5f5dc,
          transparent: true,
          opacity: 0.7,
        }),
      );
      rib.position.set(0, -0.8 + i * 0.2, 0);
      rib.rotation.x = Math.PI / 2;
      rib.castShadow = true;
      skeletonGroup.add(rib);
    }

    // Kollar
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    leftArm.position.set(-1, -0.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    skeletonGroup.add(leftArm);

    const rightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    rightArm.position.set(1, -0.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    skeletonGroup.add(rightArm);

    // Bacaklar
    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    leftLeg.position.set(-0.3, -2.8, 0);
    leftLeg.castShadow = true;
    skeletonGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
      new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8,
      }),
    );
    rightLeg.position.set(0.3, -2.8, 0);
    rightLeg.castShadow = true;
    skeletonGroup.add(rightLeg);

    // Animasyon için referans sakla
    skeletonGroup.userData = {
      rotationSpeed: 0.002,
    };

    sceneRef.current.add(skeletonGroup);

    // Animasyon loop'u ekle
    const animateSkeleton = () => {
      if (skeletonGroup.userData) {
        // Genel dönüş
        skeletonGroup.rotation.y += skeletonGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateSkeleton);
      skeletonGroup.userData.animationLoop = animationId;
    };
    animateSkeleton();
  };

  // Kas modeli oluşturma
  const createMuscleModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const muscleGroup = new THREE.Group();

    // Ana kas grubu
    const mainMuscle = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.8, 1.5, 8, 16),
      new THREE.MeshPhongMaterial({
        color: 0xff6666,
        transparent: true,
        opacity: 0.8,
      }),
    );
    mainMuscle.castShadow = true;
    muscleGroup.add(mainMuscle);

    // Kas lifleri
    for (let i = 0; i < 20; i++) {
      const muscleFiber = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 1.2, 4, 8),
        new THREE.MeshPhongMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.9,
        }),
      );
      muscleFiber.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8,
      );
      muscleFiber.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      muscleFiber.userData = {
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05,
      };
      muscleFiber.castShadow = true;
      muscleGroup.add(muscleFiber);
    }

    // Kas kasılma animasyonu için referans sakla
    muscleGroup.userData = {
      contraction: 0,
      rotationSpeed: 0.003,
    };

    sceneRef.current.add(muscleGroup);

    // Animasyon loop'u ekle
    const animateMuscle = () => {
      if (muscleGroup.userData) {
        // Kas kasılma efekti
        muscleGroup.userData.contraction += 0.05;
        const contraction = 1 + Math.sin(muscleGroup.userData.contraction) * 0.2;
        mainMuscle.scale.setScalar(contraction);

        // Kas lifleri nabız efekti
        muscleGroup.children.forEach((child) => {
          if (child.userData.pulse) {
            child.userData.pulse += child.userData.pulseSpeed;
            const pulse = 1 + Math.sin(child.userData.pulse) * 0.3;
            child.scale.setScalar(pulse);
          }
        });

        // Genel dönüş
        muscleGroup.rotation.y += muscleGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateMuscle);
      muscleGroup.userData.animationLoop = animationId;
    };
    animateMuscle();
  };

  // Mitokondri modeli oluşturma
  const createMitochondriaModel = () => {
    if (!sceneRef.current) {return;}

    // Tüm önceki modelleri temizle
    clearAllModels();

    const mitochondriaGroup = new THREE.Group();

    // Ana mitokondri zarı (dış zar)
    const outerMembrane = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.8, 1.5, 8, 16),
      new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      }),
    );
    outerMembrane.castShadow = true;
    mitochondriaGroup.add(outerMembrane);

    // İç zar (cristae) - mitokondri karakteristik özelliği
    for (let i = 0; i < 12; i++) {
      const crista = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.6, 1.2, 6, 12),
        new THREE.MeshPhongMaterial({
          color: 0x00cc66,
          transparent: true,
          opacity: 0.8,
        }),
      );
      crista.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8,
      );
      crista.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      crista.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulse: Math.random() * Math.PI * 2,
      };
      crista.castShadow = true;
      mitochondriaGroup.add(crista);
    }

    // Mitokondri matrisi (iç sıvı)
    const matrix = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 1.3, 6, 12),
      new THREE.MeshPhongMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.2,
      }),
    );
    matrix.castShadow = true;
    mitochondriaGroup.add(matrix);

    // Enerji parçacıkları (ATP)
    for (let i = 0; i < 25; i++) {
      const atp = new THREE.Mesh(
        new THREE.SphereGeometry(0.03),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5,
        }),
      );
      atp.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
      );
      atp.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      atp.castShadow = true;
      mitochondriaGroup.add(atp);
    }

    // Animasyon için referans sakla
    mitochondriaGroup.userData = {
      rotationSpeed: 0.003,
      pulse: 0,
    };

    sceneRef.current.add(mitochondriaGroup);

    // Animasyon loop'u ekle
    const animateMitochondria = () => {
      if (mitochondriaGroup.userData) {
        // Ana mitokondri nabız efekti
        mitochondriaGroup.userData.pulse += 0.04;
        const pulse = 1 + Math.sin(mitochondriaGroup.userData.pulse) * 0.1;
        outerMembrane.scale.setScalar(pulse);

        // Cristae animasyonları
        mitochondriaGroup.children.forEach((child) => {
          if (child.userData.rotationSpeed) {
            child.rotation.y += child.userData.rotationSpeed;
            child.userData.pulse += 0.05;
            const cristaPulse = 1 + Math.sin(child.userData.pulse) * 0.2;
            child.scale.setScalar(cristaPulse);
          }

          // ATP yanıp sönme efekti
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        mitochondriaGroup.rotation.y += mitochondriaGroup.userData.rotationSpeed;
      }
      const animationId = requestAnimationFrame(animateMitochondria);
      mitochondriaGroup.userData.animationLoop = animationId;
    };
    animateMitochondria();
  };

  // Özel model oluşturma
  const createCustomModel = (_modelPrompt: string, aiData: AiChatOutput) => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    const customGroup = new THREE.Group();

    // AI response'a göre ana model
    const mainGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mainMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.8,
    });

    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    mainMesh.userData = { rotationSpeed: 0.01 };
    customGroup.add(mainMesh);

    // AI response'dan önerilen konulara göre ek modeller
    if (aiData.suggestedTopics.length > 0) {
      aiData.suggestedTopics.forEach((_topic, index) => {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.2),
          new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8,
          }),
        );
        sphere.position.set(
          Math.cos(index * 0.8) * 3,
          Math.sin(index * 0.8) * 3,
          0,
        );
        sphere.userData = {
          orbitRadius: 3,
          angle: index * 0.8,
          speed: 0.02 + index * 0.01,
        };
        sphere.castShadow = true;
        customGroup.add(sphere);
      });
    }

    // AI response'dan öğrenme ipuçlarına göre ek bileşenler
    if (aiData.learningTips.length > 0) {
      aiData.learningTips.forEach((_tip, index) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.15, 0.15),
          new THREE.MeshPhongMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.9,
          }),
        );
        cube.position.set(
          Math.cos(index * 1.2) * 2,
          Math.sin(index * 1.2) * 2,
          Number(Math.cos(index * 0.5)) * 1,
        );
        cube.userData = {
          pulse: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
        };
        cube.castShadow = true;
        customGroup.add(cube);
      });
    }

    // Güven seviyesine göre parçacık efekti
    const particleCount = Math.floor(aiData.confidence * 50);
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5,
        }),
      );
      particle.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      );
      particle.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
      };
      customGroup.add(particle);
    }

    // Animasyon için referans sakla
    customGroup.userData = {
      rotationSpeed: 0.005,
    };

    sceneRef.current.add(customGroup);

    // Animasyon loop'u ekle
    const animateCustom = () => {
      if (customGroup.userData) {
        // Ana model dönüşü
        mainMesh.rotation.y += mainMesh.userData.rotationSpeed;

        // Önerilen konular yörünge hareketi
        customGroup.children.forEach((child) => {
          if (child.userData.orbitRadius) {
            const sphere = child as THREE.Mesh;
            sphere.userData.angle += sphere.userData.speed;
            sphere.position.x = Math.cos(sphere.userData.angle) * sphere.userData.orbitRadius;
            sphere.position.y = Math.sin(sphere.userData.angle) * sphere.userData.orbitRadius;
          }

          // Öğrenme ipuçları animasyonları
          if (child.userData.pulse) {
            child.userData.pulse += 0.05;
            const pulse = 1 + Math.sin(child.userData.pulse) * 0.2;
            child.scale.setScalar(pulse);
            child.rotation.y += child.userData.rotationSpeed;
          }

          // Parçacık yanıp sönme efekti
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
          }
        });

        // Genel dönüş
        customGroup.rotation.y += customGroup.userData.rotationSpeed;
      }
      requestAnimationFrame(animateCustom);
    };
    animateCustom();
  };

  // Örnek 3D model oluşturma (fallback)
  const createSample3DModel = (modelPrompt: string) => {
    if (!sceneRef.current) {return;}

    // Mevcut modelleri temizle
    const existingModels = sceneRef.current.children.filter(child =>
      child.type === 'Mesh' && child !== sceneRef.current!.children[0], // Işıkları koru
    );
    existingModels.forEach(model => sceneRef.current!.remove(model));

    // Prompt'a göre farklı modeller
    if (modelPrompt.toLowerCase().includes('dna')) {
      createDNAModel();

    } else if (modelPrompt.toLowerCase().includes('atom')) {
      createAtomModel();

    } else if (modelPrompt.toLowerCase().includes('hücre')) {
      createCellModel();

    } else {
      // Varsayılan animasyonlu model
      createAnimatedDefaultModel();
    }
  };

  // Animasyonlu varsayılan model
  const createAnimatedDefaultModel = () => {
    if (!sceneRef.current) {return;}

    const defaultGroup = new THREE.Group();

    // Ana küp
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.8,
    });

    const mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    mainMesh.userData = { rotationSpeed: 0.02 };
    defaultGroup.add(mainMesh);

    // Etrafında dönen küçük küpler
    for (let i = 0; i < 8; i++) {
      const smallCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshPhongMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.9,
        }),
      );
      smallCube.position.set(
        Math.cos(i * Math.PI / 4) * 2,
        Math.sin(i * Math.PI / 4) * 2,
        0,
      );
      smallCube.userData = {
        orbitRadius: 2,
        angle: i * Math.PI / 4,
        speed: 0.03 + i * 0.01,
      };
      smallCube.castShadow = true;
      defaultGroup.add(smallCube);
    }

    // Parçacık sistemi
    for (let i = 0; i < 20; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5,
        }),
      );
      particle.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      );
      particle.userData = {
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.05 + Math.random() * 0.1,
        float: Math.random() * Math.PI * 2,
        floatSpeed: 0.02 + Math.random() * 0.03,
      };
      defaultGroup.add(particle);
    }

    // Animasyon için referans sakla
    defaultGroup.userData = {
      rotationSpeed: 0.01,
    };

    sceneRef.current.add(defaultGroup);

    // Animasyon loop'u ekle
    const animateDefault = () => {
      if (defaultGroup.userData) {
        // Ana küp dönüşü
        mainMesh.rotation.y += mainMesh.userData.rotationSpeed;
        mainMesh.rotation.x += mainMesh.userData.rotationSpeed * 0.5;

        // Küçük küpler yörünge hareketi
        defaultGroup.children.forEach((child) => {
          if (child.userData.orbitRadius) {
            const cube = child as THREE.Mesh;
            cube.userData.angle += cube.userData.speed;
            cube.position.x = Math.cos(cube.userData.angle) * cube.userData.orbitRadius;
            cube.position.y = Math.sin(cube.userData.angle) * cube.userData.orbitRadius;
            cube.rotation.y += 0.05;
          }

          // Parçacık animasyonları
          if (child.userData.blink) {
            child.userData.blink += child.userData.blinkSpeed;
            child.userData.float += child.userData.floatSpeed;

            const blink = 0.3 + Math.sin(child.userData.blink) * 0.7;
            const float = Math.sin(child.userData.float) * 0.1;

            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = blink;
            mesh.position.y += float;
          }
        });

        // Genel dönüş
        defaultGroup.rotation.y += defaultGroup.userData.rotationSpeed;
      }
      requestAnimationFrame(animateDefault);
    };
    animateDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Menu */}
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-blue-600 dark:text-purple-500" />
            AI Destekli 3D Eğitim
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI Chat Flow ile 3D modeller üret, Three.js ile görselleştir
          </p>
        </div>

        {/* AI Prompt Input */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örnek: DNA sarmalı göster, Atom yapısı, Hücre yapısı..."
              className="md:col-span-2 px-4 py-3 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            />
            <button
              onClick={() => {
                void generate3DModel();
              }}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Üretiliyor...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  3D Model Üret
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Konu (Biyoloji, Kimya, Fizik...)"
              className="px-4 py-3 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            />
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as 'Basit' | 'Orta' | 'Karmaşık')}
              className="px-4 py-3 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            >
              <option value="Basit">Basit</option>
              <option value="Orta">Orta</option>
              <option value="Karmaşık">Karmaşık</option>
            </select>
          </div>

                     <div className="mt-4 flex flex-col sm:flex-row gap-3">
             <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
               <Lightbulb className="w-4 h-4 text-yellow-500" />
               Öneriler: &quot;DNA sarmalı&quot;, &quot;Atom yapısı&quot;, &quot;Hücre yapısı&quot;, &quot;Kalp modeli&quot;
             </div>
             <div className="flex gap-2">
               <button
                 onClick={() => createDNAModel()}
                 className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
               >
                 DNA Modeli
               </button>
               <button
                 onClick={() => createAtomModel()}
                 className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
               >
                 Atom Modeli
               </button>
               <button
                 onClick={() => createCellModel()}
                 className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
               >
                 Hücre Modeli
               </button>
             </div>
           </div>
        </div>

                          {/* AI Response Display */}
         {aiResponse && (
           <div className="max-w-4xl mx-auto mb-8 border-gradient-question shadow-lg rounded-xl p-6">
             <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <Brain className="w-6 h-6 text-purple-600" />
               AI Yanıtı
             </h3>
             <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Cevabı</h4>
                 <p className="text-sm whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                   {aiResponse.response}
                 </p>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Güven Seviyesi</h4>
                 <p className="text-sm">{(aiResponse.confidence * 100).toFixed(1)}%</p>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Önerilen Konular</h4>
                 <div className="flex flex-wrap gap-2">
                   {aiResponse.suggestedTopics.map((topic, index) => (
                     <span key={index} className="px-2 py-1 bg-blue-600/20 dark:bg-purple-600/20 rounded text-xs">
                       {topic}
                     </span>
                   ))}
                 </div>
               </div>
               <div>
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Öğrenme İpuçları</h4>
                 <div className="space-y-1">
                   {aiResponse.learningTips.map((tip, index) => (
                     <p key={index} className="text-xs flex items-center gap-2">
                       <Lightbulb className="w-3 h-3 text-yellow-500" />
                       {tip}
                     </p>
                   ))}
                 </div>
               </div>
             </div>

           </div>
         )}

        {/* 3D Model Viewer */}
        <div className="relative">
          <div
            ref={mountRef}
            className="w-full h-[600px] rounded-xl border border-gray-200 dark:border-white/20 bg-white/50 dark:bg-black/50 overflow-hidden"
          />

          {aiResponse && (
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              AI Model üretildi!
            </div>
          )}
        </div>

        {/* AI Özellikleri */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Chat Flow</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Mevcut AI altyapısı ile 3D model üretimi
            </p>
          </div>

          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Palette className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Three.js</h3>
            <p className="text-gray-600 dark:text-gray-300">
              WebGL tabanlı 3D grafik kütüphanesi ile interaktif görselleştirme
            </p>
          </div>

          <div className="border-gradient-question shadow-lg rounded-xl p-6">
            <div className="text-3xl mb-4 flex justify-center">
              <Zap className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Serverless</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AI flow ile hızlı ve güvenilir model üretimi
            </p>
          </div>
        </div>

        {/* Kullanım Talimatları */}
        <div className="mt-12 border-gradient-question shadow-lg rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Nasıl Kullanılır?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                1. Prompt Yaz
              </h4>
              <p>İstediğin 3D modeli açıkla: &quot;DNA sarmalı göster&quot;, &quot;Atom yapısı&quot; gibi</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                2. AI Model Üret
              </h4>
              <p>AI Chat flow ile 3D model verisi üretilir ve Three.js ile render edilir</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                3. İnteraktif İncele
              </h4>
              <p>Mouse ile modeli döndür, zoom yap, farklı açılardan incele</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                4. Eğitimde Kullan
              </h4>
              <p>Biyoloji, kimya, fizik derslerinde 3D modelleri kullan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
