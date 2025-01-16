# NestJS App

A NestJS app with OpenAI integration.

---

## Installation

1. Install dependencies:
    ```bash
    npm install
    ```
2. Set up environment variables:

   - Copy .env.example to .env:
        ```bash
        cp .env.example .env
        ```
   - Update the OPENAI_API_KEY variable in the .env file with your OpenAI API key:
      ```bash
      OPENAI_API_KEY=your_openai_api_key_here
      ```
   - Update the PORT variable in the .env file:
      ```bash
      PORT=3000
      ```
## Running the Application

Start in Production Mode:
```bash
npm start
```

Start in Development Mode:
```bash
npm run start:dev
```
## Testing

Run Unit Tests:
```bash
npm run test
```

Run End-to-End (E2E) Tests:
```bash
npm run test:e2e
```