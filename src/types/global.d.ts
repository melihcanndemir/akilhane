// Web Speech API Type Definitions
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// PWA Type Definitions
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface ServiceWorkerRegistration {
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  scope: string;
  updateViaCache: 'all' | 'imports' | 'none';
  onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
}

interface ServiceWorker {
  scriptURL: string;
  state: 'parsed' | 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
  onstatechange: ((this: ServiceWorker, ev: Event) => any) | null;
  postMessage(message: any, transfer?: Transferable[]): void;
}

interface ServiceWorkerContainer {
  controller: ServiceWorker | null;
  ready: Promise<ServiceWorkerRegistration>;
  oncontrollerchange: ((this: ServiceWorkerContainer, ev: Event) => any) | null;
  onmessage: ((this: ServiceWorkerContainer, ev: MessageEvent) => any) | null;
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
  getRegistration(scope?: string): Promise<ServiceWorkerRegistration | undefined>;
  getRegistrations(): Promise<ServiceWorkerRegistration[]>;
  startMessages(): void;
}

interface RegistrationOptions {
  scope?: string;
  updateViaCache?: 'all' | 'imports' | 'none';
}

interface SpeechSynthesis extends EventTarget {
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface SpeechSynthesisErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    speechSynthesis: SpeechSynthesis;
    serviceWorker: ServiceWorkerContainer;
    matchMedia(query: string): MediaQueryList;
  }
}

export {}; 