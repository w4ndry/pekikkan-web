export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = 'sk_9434f9229a52611b8c9ccd3360821866419ce2f595fc164a';
  }

  private isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  async textToSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<ArrayBuffer> {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key is not configured. Please add VITE_ELEVENLABS_API_KEY to your environment variables.');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your API key and try again.');
      } else if (response.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded. Please try again later.');
      } else if (response.status === 402) {
        throw new Error('ElevenLabs API quota exceeded. Please check your account balance.');
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
      }
    }

    return response.arrayBuffer();
  }

  async playQuote(content: string, author: string): Promise<void> {
    console.log("this.apiKey", this.apiKey)
    if (!this.isConfigured()) {
      throw new Error('Text-to-speech is not available. ElevenLabs API key is not configured.');
    }

    const text = `${content} - ${author}`;
    
    try {
      const audioBuffer = await this.textToSpeech(text);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      // Handle audio loading and playing
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadeddata', () => {
          audio.play()
            .then(() => resolve())
            .catch(reject);
        });

        audio.addEventListener('error', () => {
          reject(new Error('Failed to load audio. Please try again.'));
        });

        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        });

        // Clean up URL if there's an error
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(audioUrl);
        });
      });
    } catch (error) {
      console.error('Error playing quote:', error);
      throw error;
    }
  }

  // Check if the service is properly configured
  getStatus(): { configured: boolean; message: string } {
    console.log("this.apiKey", this.apiKey)
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'ElevenLabs API key is not configured. Add VITE_ELEVENLABS_API_KEY to your .env file.'
      };
    }

    return {
      configured: true,
      message: 'ElevenLabs service is configured and ready.'
    };
  }
}

export const elevenLabsService = new ElevenLabsService();