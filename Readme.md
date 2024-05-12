# React AI App

React playground for AI models with streaming capabilities and production-ready setup.

## Features

- [x] Streaming capabilities
- [x] Production-ready
- [x] Authentication with server proxy provided
- [x] Easily add your own AI models and themes

## Setup

Follow these steps to set up the project:

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

