"""
AI Chatbot integration using Google Gemini API
"""

import os
import requests
from typing import Optional

class AIChatbot:
    """Google Gemini AI chatbot for autism support"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI chatbot with Gemini API
        
        Args:
            api_key: Gemini API key (required)
        """
        self.api_key = api_key
        if not self.api_key:
            raise ValueError("Gemini API key is required. Get one from: https://makersuite.google.com/app/apikey")
        
        # System prompt for autism support context
        self.system_prompt = """You are a compassionate and knowledgeable AI assistant specializing in autism spectrum disorder (ASD) support. Your role is to:

1. Provide accurate, evidence-based information about autism
2. Offer supportive guidance to parents and caregivers
3. Explain early signs and symptoms in a sensitive manner
4. Suggest appropriate interventions and therapies
5. Be empathetic and non-judgmental
6. Encourage professional consultation when appropriate
7. Never provide medical diagnoses - only general information

Keep responses clear, concise (2-3 paragraphs), and actionable. Always emphasize that professional evaluation is important for accurate diagnosis."""

    def generate_response(self, user_message: str) -> str:
        """
        Generate response using Google Gemini API
        
        Args:
            user_message: User's question or message
            
        Returns:
            AI-generated response
        """
        return self._gemini_response(user_message)

    def _gemini_response(self, user_message: str) -> str:
        """Generate response using Google Gemini API"""
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        try:
            # Use gemini-2.5-flash (current available model)
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{self.system_prompt}\n\nUser question: {user_message}\n\nProvide a helpful, compassionate response:"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract text from Gemini response
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                content = candidate.get('content', {})
                parts = content.get('parts', [])
                
                # Handle new response format where text might be in parts
                if parts and isinstance(parts, list) and len(parts) > 0:
                    text = parts[0].get('text', '')
                    if text:
                        return text
                
                # Handle case where response was cut off (MAX_TOKENS)
                finish_reason = candidate.get('finishReason', '')
                if finish_reason == 'MAX_TOKENS':
                    return "I apologize, but my response was cut off. Could you please rephrase your question or ask for a more specific aspect?"
            
            # If no valid response found
            print(f"Gemini API returned unexpected format: {data}")
            return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
            
        except requests.exceptions.HTTPError as e:
            error_msg = f"Gemini API HTTP error: {e}"
            if e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('error', {}).get('message', str(e))
                except:
                    pass
            print(f"Gemini API Error: {error_msg}")
            return f"I'm currently experiencing technical difficulties connecting to the AI service. Please try again later. (Error: {error_msg})"
            
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return "I'm having trouble connecting to the AI service. Please check your internet connection and try again."
            
        except Exception as e:
            print(f"Unexpected error in Gemini response: {e}")
            return "An unexpected error occurred. Please try again."
