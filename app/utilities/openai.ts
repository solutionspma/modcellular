/**
 * OpenAI Utility
 * 
 * Wrapper for OpenAI API calls (voicemail transcription, etc.)
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Transcribe audio using Whisper
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Download audio file
    const response = await fetch(audioUrl);
    const audioBlob = await response.blob();
    
    // Convert to File object
    const audioFile = new File([audioBlob], 'voicemail.mp3', { type: 'audio/mpeg' });
    
    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Transcription failed:', error);
    return '[Transcription unavailable]';
  }
}

/**
 * Generate AI summary of voicemail
 */
export async function summarizeVoicemail(transcript: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes voicemail transcripts in 1-2 sentences.',
        },
        {
          role: 'user',
          content: `Summarize this voicemail: ${transcript}`,
        },
      ],
      max_tokens: 100,
    });
    
    return completion.choices[0].message.content || transcript;
  } catch (error) {
    console.error('Summary failed:', error);
    return transcript;
  }
}

export default openai;
