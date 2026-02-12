import { GoogleGenAI } from "@google/genai";
import { MarketData, CompetitorDetail } from "../types";

// System Instruction for the Persona
const SYSTEM_INSTRUCTION = `
I. ROLE & PERSONA
You are the Lead Market Research Scientist for the consolidated entity AD&I (Affordable Dentures & Implants) and DDS (DDS Dentures + Implant Solutions). Your mission is to deliver "Data-Hardened" competitive intelligence across various DMAs, primarily focused on the DFW (Dallas-Fort Worth) market. You speak with scientific rigor, precision, and a focus on "Apples-to-Apples" financial comparison.

II. OPERATIONAL CHAIN OF COMMAND (Data Hierarchy)
Level 1 (Absolute Truth): User-Provided "HLRL Locks".
Level 2 (Internal Knowledge): Internal PDFs/Knowledge Base.
Level 3 (Market Discovery): Real-time Search/Maps.

III. PRICING & TIERING STANDARDS
Tier 0: Economy (Denture-only).
Tier 1: EconomyPlus Dentures (Low-Range/High-Range).
Tier 2: Premium.
Tier 3: UltimateFit.

IV. OUTPUT PROTOCOLS
Produce strict structured data for Competitive Matrices and Appendices.
Guardrail: If a price is significantly lower than AD&I's floor, mark as "TBD".
`;

// Level 1: HLRL Locks for DFW (Updated with CSV Data)
const DFW_HLRL_LOCKS: MarketData[] = [
  { dsoName: "Ideal Dental (DECA)", geographicFocus: "National", dentistCount: 136, clinicCount: 65, dentistsPerClinic: 2.09, surgeonCount: 12, priceDenture: 650, priceTier1Low: 1000, priceTier1High: 1500 },
  { dsoName: "Smile Brands", geographicFocus: "National", dentistCount: 50, clinicCount: 51, dentistsPerClinic: 0.98, surgeonCount: 8, priceDenture: 650, priceTier1Low: 950, priceTier1High: 1350 },
  { dsoName: "Jefferson Dental", geographicFocus: "Regional", dentistCount: 40, clinicCount: 35, dentistsPerClinic: 1.14, surgeonCount: 6, priceDenture: 550, priceTier1Low: 699, priceTier1High: 1100 },
  { dsoName: "Pacific Dental (PDS)", geographicFocus: "National", dentistCount: 38, clinicCount: 35, dentistsPerClinic: 1.09, surgeonCount: 10, priceDenture: 700, priceTier1Low: 1100, priceTier1High: 1600 },
  { dsoName: "Heartland Dental", geographicFocus: "National", dentistCount: 45, clinicCount: 30, dentistsPerClinic: 1.5, surgeonCount: 8, priceDenture: 1100, priceTier1Low: 1100, priceTier1High: 1600 },
  { dsoName: "AD&I/DDS", geographicFocus: "National", dentistCount: 45, clinicCount: 22, dentistsPerClinic: 2.05, surgeonCount: 6, priceDenture: 499, priceTier1Low: 800, priceTier1High: 1200 },
  { dsoName: "Aspen Dental", geographicFocus: "National", dentistCount: 19, clinicCount: 20, dentistsPerClinic: 0.95, surgeonCount: 4, priceDenture: 499, priceTier1Low: 1100, priceTier1High: 1400 },
  { dsoName: "Great Expressions", geographicFocus: "National", dentistCount: 8, clinicCount: 8, dentistsPerClinic: 1, surgeonCount: 2, priceDenture: 850, priceTier1Low: 850, priceTier1High: 1250 },
  { dsoName: "Sage Dental", geographicFocus: "Regional", dentistCount: 6, clinicCount: 6, dentistsPerClinic: 1, surgeonCount: 1, priceDenture: 800, priceTier1Low: 900, priceTier1High: 1350 },
  { dsoName: "Archpoint ID", geographicFocus: "Local", dentistCount: 5, clinicCount: 3, dentistsPerClinic: 1.67, surgeonCount: 2, priceDenture: 'TBD', priceTier1Low: 1500, priceTier1High: 3000 },
  { dsoName: "ClearChoice", geographicFocus: "Local", dentistCount: 3, clinicCount: 3, dentistsPerClinic: 1, surgeonCount: 3, priceDenture: 'TBD', priceTier1Low: 'TBD', priceTier1High: 'TBD' },
  { dsoName: "Texas Implant & Dental", geographicFocus: "Local", dentistCount: 4, clinicCount: 2, dentistsPerClinic: 2, surgeonCount: 1, priceDenture: 895, priceTier1Low: 895, priceTier1High: 1700 },
  { dsoName: "Fast New Smile", geographicFocus: "Local", dentistCount: 3, clinicCount: 2, dentistsPerClinic: 1.5, surgeonCount: 3, priceDenture: 'TBD', priceTier1Low: 'TBD', priceTier1High: 'TBD' },
  { dsoName: "Nuvia", geographicFocus: "Local", dentistCount: 4, clinicCount: 2, dentistsPerClinic: 2, surgeonCount: 4, priceDenture: 'TBD', priceTier1Low: 2500, priceTier1High: 3000 },
  { dsoName: "New Choice Dentures", geographicFocus: "Local", dentistCount: 3, clinicCount: 1, dentistsPerClinic: 3, surgeonCount: 1, priceDenture: 550, priceTier1Low: 795, priceTier1High: 1500 }
];

class GeminiService {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.0-flash'; // Optimized for speed/json

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Helper to clean JSON from Markdown
  private cleanJson(text: string): string {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) return match[1];
    const match2 = text.match(/```\s*([\s\S]*?)\s*```/);
    if (match2) return match2[1];
    return text;
  }

  // Generate the Market Matrix (Page 1 Data)
  async generateMarketMatrix(dmaInput: string): Promise<MarketData[]> {
    const dma = dmaInput.trim();
    const lowerDma = dma.toLowerCase();

    // Level 1: HLRL Locks
    // If the DMA matches DFW (loose matching), return the user-provided lock data directly.
    if (lowerDma.includes('dallas') || lowerDma.includes('dfw')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(DFW_HLRL_LOCKS);
        }, 800); 
      });
    }

    // Level 3: AI Discovery for other markets
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Conduct a market analysis for the "${dma}" DMA (Designated Market Area). 
    1. Use Google Search to identify the top 10-15 Dental Service Organizations (DSOs) and key implant competitors operating in this specific region.
    2. For each competitor, ESTIMATE key operational metrics if exact public data is unavailable. Use the typical size of these chains in similar markets as a baseline for estimation.
    3. Search for pricing (dentures, implants) for these brands. If specific local pricing is missing, use national averages for that brand or "TBD".
    
    Return a STRICT JSON ARRAY of objects. Do not include any text outside the JSON block.
    
    Schema:
    - "dsoName" (string)
    - "geographicFocus" (string: "National", "Regional", or "Local")
    - "clinicCount" (integer: est number of clinics in this DMA)
    - "dentistCount" (integer: est total dentists in this DMA)
    - "surgeonCount" (integer: est oral surgeons/implantologists)
    - "priceDenture" (number: price for economy denture, or -1 if unknown)
    - "priceTier1Low" (number: price for Tier 1 economy plus low range, or -1 if unknown)
    - "priceTier1High" (number: price for Tier 1 economy plus high range, or -1 if unknown)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      if (!text) return [];
      
      const cleanedJson = this.cleanJson(text);
      const rawData = JSON.parse(cleanedJson);
      
      return rawData.map((item: any) => ({
        ...item,
        dentistsPerClinic: item.clinicCount > 0 ? Number((item.dentistCount / item.clinicCount).toFixed(2)) : 0,
        priceDenture: item.priceDenture === -1 ? 'TBD' : item.priceDenture,
        priceTier1Low: item.priceTier1Low === -1 ? 'TBD' : item.priceTier1Low,
        priceTier1High: item.priceTier1High === -1 ? 'TBD' : item.priceTier1High,
      }));

    } catch (error) {
      console.error("Error generating market matrix:", error);
      return [];
    }
  }

  // Generate Competitor Details (Page 2 Data)
  async generateCompetitorDetails(dma: string, dsoName: string): Promise<CompetitorDetail> {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Deep dive on "${dsoName}" in ${dma}. 
    Return a STRICT JSON OBJECT with keys: 
    - "dsoName" (string)
    - "dentistNames" (array of strings: real names found in public records)
    - "surgeonNames" (array of strings)
    - "evidenceSource" (string: url or citation)`;
    
    try {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }],
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No text returned");
        
        const cleanedJson = this.cleanJson(text);
        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error("Error getting details:", error);
        return { dsoName, dentistNames: [], surgeonNames: [], evidenceSource: "Error fetching data or no public records found." };
    }
  }

  // General Chat
  async chatWithAgent(message: string, history: any[]) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
      
      const chat = this.ai.chats.create({
          model: 'gemini-2.0-flash',
          config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools: [{ googleSearch: {} }] 
          },
          history: history
      });
      
      return chat.sendMessageStream({ message });
  }

  // Image Generation (Nano Banana Pro)
  async generateImage(prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '1:1') {
      const model = size === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      try {
        const response = await this.ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: aspectRatio
                }
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 return `data:image/png;base64,${part.inlineData.data}`;
             }
        }
        return null;
      } catch (e) {
          console.error(e);
          return null;
      }
  }

  // Veo Video Generation
  async generateVideo(prompt: string) {
       this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

       try {
        let operation = await this.ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        
        while(!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await this.ai.operations.getVideosOperation({operation});
        }
        
        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) return `${uri}&key=${process.env.API_KEY}`;
        return null;

       } catch (e) {
           console.error(e);
           return null;
       }
  }
}

export const geminiService = new GeminiService();