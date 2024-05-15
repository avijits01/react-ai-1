import { OpenAIIcon } from './src/components/OpenAIIcon';


export const DOMAIN = process.env.EXPO_PUBLIC_ENV === 'DEVELOPMENT' ?
  process.env.EXPO_PUBLIC_DEV_API_URL :
  process.env.EXPO_PUBLIC_PROD_API_URL

  // used to define models globally. Is further used in the settings screen and chat modal to select the model
export const MODELS = {
  gpt: { name: 'GPT 4', label: 'gpt', icon: OpenAIIcon },
  gptTurbo: { name: 'GPT Turbo', label: 'gptTurbo', icon: OpenAIIcon },
  // add more chat models here
}

// used to define image models globally. Is further used in the settings screen to select the image model
export const IMAGE_MODELS = {
  fastImage: { name: 'Fast Image (LCM)', label: 'fastImage' },
  stableDiffusionXL: { name: 'Stable Diffusion XL', label: 'stableDiffusionXL' },
  removeBg:  { name: 'Remove Background', label: 'removeBg' },
  upscale: { name: 'Upscale', label: 'upscale' },
  // add more image models here
}
