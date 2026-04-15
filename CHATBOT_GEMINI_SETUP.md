# AI Chatbot - Google Gemini Integration

## Quick Setup (2 Minutes)

### Step 1: Get Gemini API Key (FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key

### Step 2: Configure Backend

**Option A: Using Setup Script (Easiest)**

```powershell
cd backend
.\setup_ai.ps1
```

Paste your API key when prompted.

**Option B: Manual Configuration**

1. Open `backend/.env` file (create if it doesn't exist)
2. Add this line:

```
GEMINI_API_KEY=your-api-key-here
```

### Step 3: Restart Backend

```powershell
cd backend
python app.py
```

## Features

✅ **Intelligent Responses**: Context-aware, empathetic autism support  
✅ **Free Tier**: 60 requests per minute  
✅ **Specialized**: Trained for autism detection and support  
✅ **Real-time**: Fast response generation

## Test the Chatbot

Once configured, test in your app by asking:

- "What are the early signs of autism?"
- "How can I support my child with autism?"
- "What therapies are available?"

## Troubleshooting

### "Chatbot is not configured" Error

**Solution**: Add GEMINI_API_KEY to your `.env` file and restart the backend.

### "API key not valid" Error

**Solution**:

1. Verify your API key is correct
2. Check it's enabled at [Google AI Studio](https://console.cloud.google.com/apis/credentials)

### No Response from Chatbot

**Solution**: Check backend terminal for error messages and verify your internet connection.

## Response Quality

The chatbot is configured with a specialized system prompt for autism support:

- **Compassionate**: Empathetic and supportive tone
- **Evidence-based**: Provides accurate information
- **Action-oriented**: Gives practical guidance
- **Professional**: Encourages consultation when needed
- **Safe**: Never provides medical diagnoses

## API Limits (Free Tier)

- **60 requests per minute**
- **32,000 tokens per request**
- Sufficient for most applications

## Security

⚠️ **Important**:

- Never commit your API key to version control
- `.env` file should be in `.gitignore`
- Rotate your API key if exposed

## Need Help?

Visit: https://ai.google.dev/docs
