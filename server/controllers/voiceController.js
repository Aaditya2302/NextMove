const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');

// Initialize Gemini client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Prompt for Gemini
const TASK_EXTRACTION_PROMPT = `
You are an expert AI task extractor for a productivity application. 
Your goal is to listen to the user's raw voice transcript, transcribe it, and extract the primary actionable task using the Eisenhower Matrix.

### Rules
1. Transcribe the audio accurately.
2. Extract ONLY ONE primary actionable task from the transcription.
3. The title must be short (maximum 8 words).
4. If there is no clear task, classify it as a "Note".
5. Determine Urgency and Importance based on the context:
   - High urgency + High importance -> Action
   - Low urgency + High importance -> Event
   - Low importance -> Note
6. Estimate a realistic time in minutes.
7. Provide a confidence score between 0.0 and 1.0 reflecting how certain you are of the extraction.
8. Assess the user's stress level based on the context, pacing, tone, and language of their request. Rate the stress level on a scale from 1 (completely calm) to 10 (extremely stressed or overwhelmed).
9. Write a short, personalized 1-sentence motivational note (encouragement) tailored directly to the extracted task. E.g. "You've got this — one focused hour is all it takes."

### Output Format
You MUST return ONLY a valid JSON object with the following structure, with NO extra text, NO markdown code blocks, and NO explanations.
{
  "transcript": "string (the full transcribed text of the audio)",
  "title": "string",
  "type": "Action" | "Event" | "Note",
  "urgency": "high" | "low",
  "importance": "high" | "low",
  "estimatedTime": number,
  "confidence": number,
  "stressLevel": number,
  "encouragement": "string"
}
`;

/**
 * Parses strict JSON safely, handling markdown block wrapping if the LLM adds it.
 */
const parseLLMResponse = (text) => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
};

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

exports.processVoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }

    const audioPath = req.file.path;
    const mimeType = req.file.mimetype && req.file.mimetype.includes('audio/') ? req.file.mimetype : 'audio/webm';

    // Dummy Mode Fallback
    if (!genAI) {
      fs.unlink(audioPath, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });

      console.log("No GEMINI_API_KEY found. Running in dummy mode...");
      
      // Simulate network processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const transcriptText = "I need to finish my NextMove project frontend today";
      
      // Feature 5 & 6 mock data
      const taskData = {
        title: "Finish NextMove frontend",
        type: "Action",
        urgency: "high",
        importance: "high",
        estimatedTime: 120,
        confidence: 0.95,
        stressLevel: 7,
        encouragement: "You've got this — one focused hour is all it takes."
      };

      const newTask = new Task({
        ...taskData,
        originalTranscript: transcriptText,
      });

      await newTask.save();

      return res.status(201).json({
        success: true,
        message: 'Task successfully created (DUMMY MODE).',
        data: newTask
      });
    }

    // 1. Process Audio with Gemini
    let llmResponseText = "";
    try {
      const modelName = process.env.LLM_MODEL || process.env.STT_MODEL || "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });
      const audioPart = fileToGenerativePart(audioPath, mimeType);

      const result = await model.generateContent([
        { text: TASK_EXTRACTION_PROMPT },
        audioPart
      ]);
      
      llmResponseText = result.response.text();
    } catch (llmError) {
      console.error('Gemini API Error:', llmError);
      return res.status(500).json({ success: false, message: 'Failed to process audio with Gemini AI.' });
    } finally {
      // Clean up the temporary file created by Multer
      fs.unlink(audioPath, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });
    }

    if (!llmResponseText) {
      return res.status(400).json({ success: false, message: 'Could not detect any actionable content in the audio.' });
    }

    // 2. Parse JSON safely
    let parsedData;
    try {
      parsedData = parseLLMResponse(llmResponseText);
    } catch (jsonError) {
      console.error('JSON Parsing Error:', jsonError, 'Raw Text:', llmResponseText);
      return res.status(500).json({ 
        success: false, 
        message: 'AI returned malformed data.',
        transcript: 'N/A' 
      });
    }

    const transcriptText = parsedData.transcript || '';
    delete parsedData.transcript;

    // Feature 2: Filter "No task identified" or low confidence extractions
    if (parsedData.title === "No task identified" || (parsedData.confidence !== undefined && parsedData.confidence < 0.4)) {
      return res.status(200).json({
        success: false,
        noTask: true,
        message: 'No clear task detected. Try speaking more clearly.',
        transcript: transcriptText
      });
    }

    // 3. Save Task to MongoDB
    try {
      const newTask = new Task({
        ...parsedData,
        originalTranscript: transcriptText || 'No transcript generated.',
      });

      await newTask.save();

      return res.status(201).json({
        success: true,
        message: 'Task successfully created from voice.',
        data: newTask
      });
    } catch (dbError) {
      console.error('Database Save Error:', dbError);
      return res.status(500).json({ success: false, message: 'Failed to save task to the database.' });
    }

  } catch (err) {
    console.error('Unexpected error in processVoice:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    console.error('Error in getTasks:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks from database.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    return res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    console.error('Error in deleteTask:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, urgency, importance, estimatedTime } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (urgency !== undefined) updates.urgency = urgency;
    if (importance !== undefined) updates.importance = importance;
    if (estimatedTime !== undefined) updates.estimatedTime = estimatedTime;

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    return res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    console.error('Error in updateTask:', err);
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};
