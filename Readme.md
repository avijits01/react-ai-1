# React AI App

React playground for AI models with streaming capabilities and production-ready setup.

## Features

- [x] Streaming capabilities
- [x] Production-ready
- [x] Authentication with server proxy provided
- [x] Easily add your own AI models and themes

## Setup

Follow these steps to set up the project:

### OpenAI API Key

The application requires an **OpenAI API Key** to function properly, the rest of the keys are optional. You can obtain it by signing up or logging into your account at [OpenAI's API platform](https://openai.com/api/). Include the key in .env as demonstrated below.


1. In the `server` folder, create a `.env` file with the following content:

```bash
# Environment, either PRODUCTION or DEVELOPMENT
ENVIRONMENT="PRODUCTION"

# ByteScale
BYTESCALE_API_KEY="your-bytescale-api-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Anthropic
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Cohere
COHERE_API_KEY="your-cohere-api-key"

# FAL
FAL_API_KEY="your-fal-api-key"

# Replicate secret
REPLICATE_KEY="your-replicate-key"

# Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

2. In the `client` folder, create a `.env` file with the following content:

```bash
EXPO_PUBLIC_ENV="DEVELOPMENT"

# Your development URL (localhost or ngrok)
EXPO_PUBLIC_DEV_API_URL="http://localhost:3052"

# Your production URL 
EXPO_PUBLIC_PROD_API_URL="https://staging.example.com"
```

3. In the `server` folder, run the following commands:

```bash
npm install
npm run dev
```

4. In the `client` folder, run the following commands:

```bash
npm install
npm start
```

## Running on iOS Simulator

For the best experience, run the app in the iOS Simulator.

## Running on Android

1. Run in production mode by changing `expo start --android` to `expo start --android --no-dev` to avoid the Flipper code snippet that blocks streams on Android.

2. Go to `node_modules/expo/packages/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt` and remove the following code snippet:

```kotlin
if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE)
```

Replace it with the following code snippet:

```kotlin
if (response.body?.contentType()?.type == "text" && response.body?.contentType()?.subtype == "event-stream") {
    // do nothing for now
} else if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE) {
    val params2 = ExpoReceivedResponseBodyParams(now, requestId, request, response)
    dispatchEvent(Event("Expo(Network.receivedResponseBody)", params2))
}
```

For detailed information on fixing the Flipper interference in developer mode and modifying the Expo request interceptor for event streams, please refer to the following GitHub issue:
- [Fix Flipper Interference in Developer Mode and Modify Expo Request Interceptor for Event Streams](https://github.com/avijits01/react-ai-1/issues/3)

## Adding a New AI Model

Follow these steps to add a new AI model:

Server-Side:

1. Create a new file in server/src/chat with your model's implementation.

2. Use HTTP or SDK as per your model's API.

3. Test the new route in Postman. 

Client-Side:

1. Create a Custom Hook for the New Model:

   Create a new hook file similar to useGPT. For example, if the new model is called "Gemini", create useGemini.ts.
   In the hook make sure your type of messages and responses are similar to the GPTmessages and GPTResponse types.

2. Update Chat.tsx to Use the New Hook

```typescript
import useGemini from '../hooks/useGemini';
// other imports...


  // Use the appropriate hook based on chatType
  const gptHooks = {
    gpt: useGPT,
    gemini: useGemini,
    // add other hooks as needed
  };

  const { loading, input, messages, setInput, generateResponse, setMessages, scrollViewRef } = gptHooks[chatType.label](chatType);

```

## Adding a new Theme

Follow these steps to add a new Theme:

To add a new theme, open app/src/theme.ts and add a new theme with the following configuration:

```javascript
const newTheme = {
  // extend an existing theme or start from scratch
  ...lightTheme,
  name: 'newTheme',
  label: 'newTheme',
  tintColor: '#ff0000',
  textColor: '#378b29',
  tabBarActiveTintColor: '#378b29',
  tabBarInactiveTintColor: '#ff0000',
  placeholderTextColor: '#378b29',
}
```
At the bottom of the file, export the new theme:

export {
  lightTheme, darkTheme, hackerNews, miami, vercel, newTheme
}
