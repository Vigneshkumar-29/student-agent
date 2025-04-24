import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Mic, 
  MicOff, 
  Save, 
  Brain, 
  List, 
  Share, 
  Zap,
  BookOpen,
  Layers,
  StickyNote,
  Network,
  FileQuestion,
  Search,
  Loader2,
  Home,
  Menu,
  Settings,
  Sparkles,
  User,
  ArrowLeft,
  Download,
  Plus,
  History,
  Trash2,
  MessageSquare,
  AlertTriangle,
  Database,
  ArrowRight,
  Clock,
  CalendarDays,
  ChevronLeft
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { notesDB } from '@/lib/db';
import { 
  runMigrations, 
  migrateNotesAIContent, 
  migrateNoteHistoryAIContent 
} from '@/lib/migration';
import { initializeDatabase, verifyDatabaseConnection, executeFullDatabaseSetup } from '@/lib/setupNotesDatabase';

// At the top of the file, add these type declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    speechRecognition: any;
  }
}

// Get the API key from the environment variables
const API_KEY = import.meta.env.VITE_NOTES_OPENROUTER_API_KEY || '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';

// Console log to verify API key is loaded (remove in production)
console.log('API Key loaded:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No');

// Verify key is valid format
if (!API_KEY || !API_KEY.startsWith('sk-or-')) {
  console.warn('API key may not be in the correct format. Please check your .env file.');
}

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  ai_content?: {
    summary?: string;
    keyConcepts?: {concept: string, description: string}[];
    flashcards?: {question: string, answer: string}[];
    mindmap?: {nodes: {id: string, label: string}[], links: {source: string, target: string}[]};
  };
}

interface AIResponse {
  summary?: string;
  keyConcepts?: {concept: string, description: string}[];
  flashcards?: {question: string, answer: string}[];
  mindmap?: {nodes: {id: string, label: string}[], links: {source: string, target: string}[]};
}

interface NoteHistory {
  id: string;
  user_id: string;
  note_id: string;
  title: string;
  created_at: string;
  ai_content?: {
    summary?: string;
    keyConcepts?: {concept: string, description: string}[];
    flashcards?: {question: string, answer: string}[];
    mindmap?: {nodes: {id: string, label: string}[], links: {source: string, target: string}[]};
  };
}

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // All state declarations first
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [noteHistory, setNoteHistory] = useState<NoteHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // Add state for note history view
  const [showNoteHistoryView, setShowNoteHistoryView] = useState(false);
  const [selectedHistoryNote, setSelectedHistoryNote] = useState<Note | null>(null);
  
  // Then all refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // Add state for viewing a specific history entry
  const [viewingHistoryNote, setViewingHistoryNote] = useState<any>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // All useEffects next
  // Check database connection
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setConnectionStatus('checking');
        
        // Use the improved connection verification utility
        const { connected, error } = await verifyDatabaseConnection();
        
        if (connected) {
          console.log('Supabase connection verified!');
          setConnectionStatus('connected');
        } else {
          console.error('Connection error:', error);
          setConnectionStatus('error');
          setConnectionError(error || 'Failed to connect to database');
        }
      } catch (err) {
        console.error('Connection verification error:', err);
        setConnectionStatus('error');
        setConnectionError(err instanceof Error ? err.message : 'Failed to connect to database');
      }
    };
    
    verifyConnection();
  }, []);

  // Load notes when the component mounts
  useEffect(() => {
    if (user && connectionStatus === 'connected') {
      // Run migrations to ensure database structure is correct
      runMigrations(user.id).then(success => {
        if (success) {
          setDbInitialized(true);
          
          // Load notes and history after migrations
          loadNotes();
          loadNoteHistory();
        } else {
          // Migration failed
          setDbInitialized(false);
          toast({
            title: "Database Error",
            description: "Failed to set up database structure. Please try initializing the database manually.",
            variant: "destructive",
            duration: 8000
          });
        }
      });
    }
  }, [user, connectionStatus]);

  // Initialize database
  useEffect(() => {
    // Check if the notes table exists and has correct structure
    const checkDatabaseTable = async () => {
      if (!user) return;

      try {
        console.log('Checking database tables and structure...');
        
        // First, attempt to query the notes table
        const { data, error } = await supabase
          .from('notes')
          .select('id, ai_content')
          .limit(1);
        
        // If no error, check if ai_content column exists
        if (!error) {
          console.log('Notes table exists and is accessible');
          setDbInitialized(true);
          
          // Check if we got data with ai_content column
          if (data?.length > 0) {
            const hasAIContent = 'ai_content' in data[0];
            console.log('AI content column exists:', hasAIContent ? 'Yes' : 'No');
            
            // If ai_content doesn't exist in the data, try to add it
            if (!hasAIContent) {
              console.log('Adding missing ai_content column');
              await migrateNotesAIContent(user.id);
            }
            
            // Also check if note_history has ai_content
            try {
              const histResult = await supabase.rpc('exec_sql', {
                sql: `
                  SELECT column_name FROM information_schema.columns 
                  WHERE table_name = 'note_history' AND column_name = 'ai_content'
                `
              });
              
              if (!histResult.data || histResult.data.length === 0) {
                console.log('Adding missing ai_content column to note_history');
                await migrateNoteHistoryAIContent(user.id);
              }
            } catch (histErr) {
              console.warn('Error checking note_history structure:', histErr);
            }
          }
        } else {
          console.log('Notes table may not exist or has issues:', error);
          setDbInitialized(false);
          
          // Check if the error is because table doesn't exist
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            toast({
              title: "Database Setup Required",
              description: "Notes table doesn't exist. Please click Initialize Database to set up the database.",
              duration: 10000,
            });
          } else {
            toast({
              title: "Database Connection Issue",
              description: "There was a problem connecting to the database: " + error.message,
              duration: 10000,
              variant: "destructive"
            });
          }
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setDbInitialized(false);
        toast({
          title: "Database Check Failed",
          description: err instanceof Error ? err.message : "Could not verify database structure",
          duration: 10000,
          variant: "destructive"
        });
      }
    };

    checkDatabaseTable();
  }, [user]);

  // Now render UI based on connectionStatus
  if (connectionStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center mb-4 text-red-600">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">Database Connection Error</h1>
          </div>
          <p className="mb-4 text-gray-700">
            Unable to connect to the database. This could be due to:
          </p>
          <ul className="list-disc pl-5 mb-6 text-gray-700">
            <li>Network connectivity issues</li>
            <li>Invalid database credentials</li>
            <li>Database service unavailability</li>
          </ul>
          {connectionError && (
            <div className="bg-red-50 p-3 rounded mb-6 text-sm text-red-800 font-mono">
              {connectionError}
            </div>
          )}
          <p className="mb-4 text-gray-700">
            Please check your connection settings and try again.
          </p>
          <div className="flex justify-end">
            <Button 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              Refresh Page
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setConnectionStatus('checking');
                setConnectionError(null);
                // Try to verify connection again
                // This will trigger the useEffect
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading UI while checking connection
  if (connectionStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
        <p className="text-lg">Connecting to database...</p>
      </div>
    );
  }

  // Create a history entry for a note
  const createHistoryEntry = async (noteId: string, title: string, aiContent?: AIResponse) => {
    if (!user || !dbInitialized) return;
    
    try {
      console.log('Creating history entry for note:', noteId);
      
      // Store AI content in the history entry using direct API
      const { error } = await supabase
        .from('note_history')
        .insert({
          note_id: noteId,
          user_id: user.id,
          title: title,
          created_at: new Date().toISOString(),
          ai_content: aiContent || null // Include AI content in history
        });
      
      if (error) {
        console.error('Error creating history entry:', error);
      } else {
        console.log('History entry created successfully');
      }
    } catch (err) {
      console.error('Error creating history entry:', err);
    }
  };

  // Process content with OpenRouter AI API
  const processWithAI = async (content: string, type: 'summary' | 'concepts' | 'flashcards' | 'mindmap') => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some note content to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let systemPrompt = "";
      let userPrompt = "";
      
      // Configure prompts based on the task
      switch (type) {
        case 'summary':
          systemPrompt = "You are an AI assistant that helps create concise and accurate summaries of notes. Identify the main ideas and key points.";
          userPrompt = `Please summarize the following notes about ${noteTitle || "this topic"}:\n\n${content}`;
          break;
        case 'concepts':
          systemPrompt = "You are an AI assistant that helps extract key concepts from notes. For each concept, provide a clear explanation.";
          userPrompt = `Extract 4-6 key concepts from these notes and provide a brief explanation for each:\n\n${content}`;
          break;
        case 'flashcards':
          systemPrompt = "You are an AI assistant that creates study flashcards from notes. Each flashcard should have a question on one side and the answer on the other.";
          userPrompt = `Create 4-6 study flashcards (question-answer pairs) based on these notes:\n\n${content}`;
          break;
        case 'mindmap':
          systemPrompt = "You are an AI assistant that creates mind maps from notes. Identify the main topic, key concepts, and their relationships.";
          userPrompt = `Create a mind map structure for these notes. Format your response as a JSON object with 'nodes' and 'links' arrays. Each node should have an 'id' and 'label', and each link should have a 'source' (node id) and 'target' (node id):\n\n${content}`;
          break;
      }

      console.log('Sending request to OpenRouter API');
      
      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Smart Notes App'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku:beta', // Use haiku for better performance
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('API Response received:', data.choices ? 'Yes' : 'No');
      
      const aiContent = data.choices[0].message.content;
      
      let result: Partial<AIResponse> = {};
      
      // Process the AI response based on the type
      if (type === 'summary') {
        result.summary = aiContent;
      } 
      else if (type === 'concepts') {
        // Extract structured concept data from the response
        const conceptMatches = aiContent.match(/(\*\*|##|^)([^*#:]+)(?:\*\*|##)?:?\s*([^*#]+)/gm) || [];
        result.keyConcepts = conceptMatches.map(match => {
          const cleanMatch = match.replace(/^\*\*|##|\*\*$/g, '').trim();
          const [concept, description] = cleanMatch.split(/:\s*(.+)/s);
          return {
            concept: concept.trim(),
            description: (description || '').trim()
          };
        }).filter(item => item.concept && item.description);
        
        // If no structured format was detected, create a fallback
        if (result.keyConcepts.length === 0) {
          const paragraphs = aiContent.split('\n\n').filter(p => p.trim());
          result.keyConcepts = paragraphs.map((paragraph, index) => ({
            concept: `Concept ${index + 1}`,
            description: paragraph.trim()
          }));
        }
      } 
      else if (type === 'flashcards') {
        // Try to extract structured flashcard data
        const flashcardMatches = aiContent.match(/(?:Q:|Question:|^\d+\.\s*Q:)(.+?)(?:A:|Answer:)(.+?)(?=(?:Q:|Question:|\d+\.\s*Q:|$))/gms) || [];
        
        if (flashcardMatches.length > 0) {
          result.flashcards = flashcardMatches.map(match => {
            const qMatch = match.match(/(?:Q:|Question:|^\d+\.\s*Q:)(.+?)(?=A:|Answer:)/ms);
            const aMatch = match.match(/(?:A:|Answer:)(.+?)$/ms);
            
            return {
              question: qMatch ? qMatch[1].trim() : '',
              answer: aMatch ? aMatch[1].trim() : ''
            };
          }).filter(card => card.question && card.answer);
        } else {
          // If no structured format detected, try to extract Q&A pairs another way
          const lines = aiContent.split('\n').filter(line => line.trim());
          const cards = [];
          
          for (let i = 0; i < lines.length - 1; i += 2) {
            if (i + 1 < lines.length) {
              cards.push({
                question: lines[i].replace(/^\d+\.\s*/, '').trim(),
                answer: lines[i + 1].trim()
              });
            }
          }
          
          if (cards.length > 0) {
            result.flashcards = cards;
          } else {
            // Last fallback - just create generic flashcards
            result.flashcards = [
              { question: 'What is the main topic of these notes?', answer: 'The main topic is about ' + (noteTitle || 'the subject in the notes') },
              { question: 'What are the key points covered?', answer: 'The notes cover several important aspects of the topic' }
            ];
          }
        }
      }
      else if (type === 'mindmap') {
        try {
          // Try to parse the JSON response for mind map
          const jsonMatch = aiContent.match(/```json([\s\S]*?)```/) || aiContent.match(/({[\s\S]*})/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : aiContent;
          
          // Clean up any markdown or extra text
          const cleanJsonStr = jsonStr.replace(/```json|```/g, '').trim();
          
          // Parse the JSON structure
          const mindmapData = JSON.parse(cleanJsonStr);
          result.mindmap = mindmapData;
        } catch (err) {
          console.error('Failed to parse mindmap JSON:', err);
          // Create a simple fallback mindmap
          const mainNode = { id: 'main', label: noteTitle || 'Main Topic' };
          const subNodes = [
            { id: 'sub1', label: 'Key Point 1' },
            { id: 'sub2', label: 'Key Point 2' },
            { id: 'sub3', label: 'Key Point 3' },
          ];
          
          result.mindmap = {
            nodes: [mainNode, ...subNodes],
            links: subNodes.map(node => ({ source: 'main', target: node.id }))
          };
        }
      }
      
      // Update aiResponse with the new result while preserving existing content
      const updatedAiResponse = {...aiResponse, ...result};
      setAiResponse(updatedAiResponse);
      
      // Set appropriate tab based on the generated content type
      if (type === 'mindmap') {
        setActiveTab('mindmap');
      } else if (type === 'flashcards') {
        setActiveTab('flashcards');
      } else {
        setActiveTab('ai-tools');
      }
      
      // Save the note with AI content
      if (activeNote) {
        try {
          // If it's a temporary note, save it first to get a proper ID
          if (activeNote.id.startsWith('temp_')) {
            // First create the note without ai_content
            const { data, error } = await supabase
              .from('notes')
              .insert({
                user_id: user.id,
                title: noteTitle.trim() || 'Untitled Note',
                content: noteContent,
                tags: tags,
                // Skip ai_content initially
              })
              .select();
            
            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Failed to create note');
            
            const newNote = {
              ...data[0],
              createdAt: new Date(data[0].createdAt),
              updatedAt: new Date(data[0].updatedAt),
              ai_content: updatedAiResponse
            };
            
            setActiveNote(newNote);
            
            // Create history entry with AI content
            await createHistoryEntry(newNote.id, newNote.title, updatedAiResponse);
            
            // Then try to update ai_content using raw SQL
            try {
              await supabase.rpc('exec_sql', {
                sql: `
                  UPDATE notes 
                  SET ai_content = '${JSON.stringify(updatedAiResponse)}'::jsonb 
                  WHERE id = '${newNote.id}'
                `
              });
              
              console.log('Updated AI content using SQL');
            } catch (sqlErr) {
              console.warn('Failed to update AI content with SQL:', sqlErr);
            }
            
            toast({
              title: "Note Created",
              description: `Note created and ${type} generated successfully.`,
            });
          } else {
            // Update existing note with new AI content using raw SQL
            const result = await supabase.rpc('exec_sql', {
              sql: `
                UPDATE notes 
                SET ai_content = '${JSON.stringify(updatedAiResponse)}'::jsonb 
                WHERE id = '${activeNote.id}'
              `
            });
            
            if (result.error) {
              console.warn('SQL update failed:', result.error);
            } else {
              console.log('Updated AI content using SQL');
            }
            
            // Create history entry with updated AI content
            await createHistoryEntry(activeNote.id, activeNote.title, updatedAiResponse);
            
            // Get the updated note
            const { data, error } = await supabase
              .from('notes')
              .select('*')
              .eq('id', activeNote.id)
              .single();
            
            if (!error && data) {
              setActiveNote({
                ...data,
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
                ai_content: updatedAiResponse // Use our local copy
              });
            }
            
            toast({
              title: "AI Processing Complete",
              description: `Generated ${type === 'concepts' ? 'key concepts' : type} and saved to note.`,
            });
          }
          
          // Refresh the notes list to show updated content
          loadNotes().catch(err => console.error('Error refreshing notes:', err));
        } catch (saveErr) {
          console.error('Error saving note with AI content:', saveErr);
          toast({
            title: "Error Saving Note",
            description: "The AI content was generated but could not be saved to the database.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Error processing with AI:', err);
      toast({
        title: "Processing Error",
        description: "Failed to process your notes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Load notes from Supabase with better error handling
  const loadNotes = async () => {
    if (!user || !dbInitialized) {
      console.log('Not loading notes - user or database not ready');
      return;
    }
    
    try {
      console.log('Loading notes from database');
      
      // Use direct query instead of notesDB
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updatedAt', { ascending: false });
      
      if (error) throw error;
      
      // Process notes to ensure proper structure
      const processedNotes = (data || []).map(note => {
        // Ensure dates are properly parsed
        const createdAt = new Date(note.createdAt || note.created_at || Date.now());
        const updatedAt = new Date(note.updatedAt || note.updated_at || Date.now());
        
        // Ensure tags are an array
        const tags = Array.isArray(note.tags) ? note.tags : [];
        
        // Safely process ai_content
        let ai_content = note.ai_content;
        
        // If ai_content isn't in the response, try to fetch it with SQL
        if (ai_content === undefined && note.id) {
          // We'll fetch it later in a separate step
          ai_content = null;
        }
        
        return {
          ...note,
          createdAt,
          updatedAt,
          tags,
          ai_content
        };
      });
      
      console.log('Notes loaded:', processedNotes?.length || 0);
      setNotes(processedNotes);
      
      // For notes without ai_content, try to fetch it using SQL
      if (processedNotes.length > 0) {
        processedNotes.forEach(async (note) => {
          if (note.ai_content === undefined || note.ai_content === null) {
            try {
              const result = await supabase.rpc('exec_sql', {
                sql: `
                  SELECT ai_content FROM notes WHERE id = '${note.id}'
                `
              });
              
              if (result.data && result.data.length > 0 && result.data[0].ai_content) {
                // Found ai_content, update the note
                const updatedNotes = notes.map(n => 
                  n.id === note.id 
                    ? { ...n, ai_content: result.data[0].ai_content }
                    : n
                );
                setNotes(updatedNotes);
              }
            } catch (sqlErr) {
              console.warn(`Failed to fetch ai_content for note ${note.id}:`, sqlErr);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      toast({
        title: "Error Loading Notes",
        description: err instanceof Error ? err.message : "Failed to load your notes. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Load note history from Supabase
  const loadNoteHistory = async () => {
    if (!user || !dbInitialized) return;
    
    try {
      console.log('Loading note history');
      
      // Use direct query to get history entries
      const { data, error } = await supabase
        .from('note_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('History loaded:', data?.length || 0);
      setNoteHistory(data || []);
    } catch (err) {
      console.error('Error loading note history:', err);
      toast({
        title: "Error Loading History",
        description: "Failed to load your note history. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Load history for the current note
  const loadCurrentNoteHistory = async () => {
    if (!user || !activeNote || activeNote.id.startsWith('temp_')) {
      return;
    }
    
    try {
      console.log('Loading history for note:', activeNote.id);
      
      // Use direct query to get note history
      const { data, error } = await supabase
        .from('note_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_id', activeNote.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Note history loaded:', data?.length || 0);
      setNoteHistory(data || []);
    } catch (err) {
      console.error('Error loading note history:', err);
      toast({
        title: "Error Loading History",
        description: "Failed to load history for this note.",
        variant: "destructive",
      });
    }
  };

  // View a specific history entry
  const viewHistoryEntry = async (historyEntry: any) => {
    if (!user) return;
    
    try {
      console.log('Viewing history entry:', historyEntry.id, 'for note:', historyEntry.note_id);
      
      // Get the full note data first
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', historyEntry.note_id)
        .single();
      
      if (noteError) throw noteError;
      
      // Get the AI content directly from the history entry
      let historyAiContent = historyEntry.ai_content;
      
      // If the history entry doesn't have AI content, get it from the note
      if (!historyAiContent && noteData?.ai_content) {
        historyAiContent = noteData.ai_content;
      }
      
      // Set the viewing history note with all its data
      setViewingHistoryNote({
        ...noteData,
        historyTimestamp: historyEntry.created_at,
        historyTitle: historyEntry.title,
        ai_content: historyAiContent || null
      });
      
      setHistoryDialogOpen(true);
    } catch (err) {
      console.error('Error loading history entry:', err);
      toast({
        title: "Error Loading History Entry",
        description: "Could not load the selected history entry.",
        variant: "destructive",
      });
    }
  };

  // Save note to database using direct queries instead of SQL
  const saveNoteToDatabase = async (note: Note) => {
    if (!user || !dbInitialized) {
      toast({
        title: "Error",
        description: "Please sign in and make sure database is initialized",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log('Starting save operation for note:', 
        note.id.startsWith('temp_') ? 'new note' : note.id,
        'title:', note.title,
        'content length:', note.content.length,
        'has AI content:', note.ai_content ? 'yes' : 'no'
      );
      
      let savedNote;
      
      // Handle new note creation
      if (note.id.startsWith('temp_')) {
        console.log('Creating new note in database');
        
        // Create the note with all data including AI content
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            title: note.title.trim() || 'Untitled Note',
            content: note.content,
            tags: Array.isArray(note.tags) ? note.tags : [],
            ai_content: note.ai_content || null
          })
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No data returned when creating note');
        }
        
        savedNote = data[0];
        console.log('Note created successfully with ID:', savedNote.id);
        
        // Add history entry with AI content
        await createHistoryEntry(savedNote.id, savedNote.title, note.ai_content);
      } 
      // Handle update to existing note
      else {
        console.log('Updating existing note:', note.id);
        
        // Update the note with all data including AI content
        const { data, error } = await supabase
          .from('notes')
          .update({
            title: note.title.trim() || 'Untitled Note',
            content: note.content,
            tags: Array.isArray(note.tags) ? note.tags : [],
            updatedAt: new Date().toISOString(),
            ai_content: note.ai_content || null
          })
          .eq('id', note.id)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No data returned when updating note');
        }
        
        savedNote = data[0];
        console.log('Note updated successfully:', savedNote.id);
        
        // Add history entry with AI content
        await createHistoryEntry(savedNote.id, savedNote.title, note.ai_content);
      }
      
      // Convert dates and ensure proper structure
      const processedNote = {
        ...savedNote,
        createdAt: new Date(savedNote.createdAt),
        updatedAt: new Date(savedNote.updatedAt),
        tags: Array.isArray(savedNote.tags) ? savedNote.tags : [],
        ai_content: savedNote.ai_content || null
      };
      
      console.log('Save operation completed successfully');
      
      // Load updated notes in background without blocking
      loadNotes().catch(err => console.error('Error reloading notes:', err));
      
      return processedNote;
    } catch (err) {
      console.error('Error saving note:', err);
      toast({
        title: "Error Saving Note",
        description: err instanceof Error 
          ? `Failed to save: ${err.message}` 
          : "Failed to save your note. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete note from database
  const deleteNote = async (noteId: string) => {
    if (!user || !dbInitialized || noteId.startsWith('temp_')) return;
    
    try {
      console.log('Deleting note:', noteId);
      const success = await notesDB.delete(noteId, user.id);
      
      if (!success) {
        throw new Error('Failed to delete note');
      }
      
      // Remove from local state
      setNotes(notes.filter(note => note.id !== noteId));
      
      if (activeNote?.id === noteId) {
        createNewNote();
      }
      
      toast({
        title: "Note Deleted",
        description: "Your note has been permanently deleted.",
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      toast({
        title: "Error Deleting Note",
        description: "Failed to delete your note. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Create a new note
  const createNewNote = () => {
    setActiveNote({
      id: `temp_${Date.now()}`,
      user_id: user?.id || '',
      title: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    });
    setNoteTitle('');
    setNoteContent('');
    setTags([]);
    setAiResponse(null);
    setActiveTab('editor');
  };

  // Start/stop voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      if (window.speechRecognition) {
        window.speechRecognition.stop();
        window.speechRecognition = null;
      }
      setIsRecording(false);
      return;
    }

    try {
      // Check if Web Speech API is available
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      // Create speech recognition instance
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      window.speechRecognition = recognition;
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Temporary variable to accumulate transcription
      let currentTranscript = '';
      
      // Handle results
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // If we have final transcript text, add it to the note
        if (finalTranscript) {
          currentTranscript += finalTranscript + ' ';
          // Append to note content
          setNoteContent(prev => {
            const newContent = prev ? prev + ' ' + finalTranscript : finalTranscript;
            return newContent;
          });
        }
        
        // Show interim results for feedback
        if (interimTranscript) {
          // Display interim somewhere (could add UI for this)
          console.log('Interim transcript:', interimTranscript);
        }
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Error",
            description: "Microphone access was denied. Please check permissions.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        }
        setIsRecording(false);
      };
      
      // Handle end of recognition
      recognition.onend = () => {
        // If we stopped manually, don't restart
        if (!isRecording) return;
        
        // Auto-restart recognition for continuous recording
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart speech recognition:', e);
          setIsRecording(false);
        }
      };
      
      // Start recording
      recognition.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone. Your words will appear in real-time.",
      });
    } catch (err) {
      console.error('Error accessing speech recognition:', err);
      toast({
        title: "Speech Recognition Error",
        description: err instanceof Error ? err.message : "Could not start speech recognition",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  // Initialize database tables with proper error handling
  const initializeDatabaseTables = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to initialize the database",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      toast({
        title: "Database Setup",
        description: "Setting up database tables. This may take a moment...",
      });
      
      // First execute the full SQL setup script
      const sqlSetupSuccess = await executeFullDatabaseSetup();
      
      if (!sqlSetupSuccess) {
        console.warn('SQL setup script had some issues, attempting alternative initialization');
      }
      
      // Then use the initialization function for additional steps and verification
      const success = await initializeDatabase(user.id);
      
      if (success) {
        setDbInitialized(true);
        
        try {
          // Run migrations to set up AI content in notes and history
          await runMigrations(user.id);
        } catch (migrationErr) {
          console.warn('Migration error, but continuing:', migrationErr);
        }
        
        toast({
          title: "Database Setup Complete",
          description: "Database tables have been created successfully. You can now use all features.",
        });
        
        // Load data now that tables exist
        await loadNotes();
        await loadNoteHistory();
      } else {
        throw new Error('Database initialization failed');
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      toast({
        title: "Database Setup Failed",
        description: err instanceof Error 
          ? `Error: ${err.message}` 
          : "Failed to set up database tables. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Select a note to edit
  const selectNote = (note: Note) => {
    setActiveNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setTags(note.tags || []);
    
    // Load AI content if available
    if (note.ai_content) {
      console.log('Loading note with AI content:', 
        `summary: ${note.ai_content.summary ? 'yes' : 'no'}`,
        `concepts: ${note.ai_content.keyConcepts?.length || 0}`,
        `flashcards: ${note.ai_content.flashcards?.length || 0}`,
        `mindmap: ${note.ai_content.mindmap ? 'yes' : 'no'}`
      );
      
      setAiResponse(note.ai_content);

      // If this note has flashcards, mindmap or other AI content, 
      // activate the appropriate tab 
      if (note.ai_content.mindmap && 
          note.ai_content.mindmap.nodes && 
          note.ai_content.mindmap.nodes.length > 1) {
        setActiveTab('mindmap');
        return; // Exit early to prioritize mindmap
      }
      
      // Check for flashcards second
      if (note.ai_content.flashcards && 
          note.ai_content.flashcards.length > 0) {
        setActiveTab('flashcards');
        return; // Exit early to prioritize flashcards
      }
      
      // If there's summary or key concepts, show AI tools
      if (note.ai_content.summary || 
          (note.ai_content.keyConcepts && note.ai_content.keyConcepts.length > 0)) {
        setActiveTab('ai-tools');
        return;
      }
    } else {
      setAiResponse(null);
    }
    
    // Default to editor tab if no AI content
    setActiveTab('editor');
  };

  // Save the current note
  const saveNote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save notes",
        variant: "destructive",
      });
      return;
    }
    
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your note",
        variant: "destructive",
      });
      return;
    }

    // Show saving toast
    toast({
      title: "Saving Note",
      description: "Your note is being saved...",
    });

    // Create note object with current values including AI content
    const noteToSave: Note = {
      id: activeNote?.id || `temp_${Date.now()}`,
      user_id: user.id,
      title: noteTitle,
      content: noteContent,
      createdAt: activeNote?.createdAt || new Date(),
      updatedAt: new Date(),
      tags: tags,
      ai_content: aiResponse || undefined
    };
    
    // Save note to database
    const savedNote = await saveNoteToDatabase(noteToSave);
    
    if (savedNote) {
      setActiveNote({
        ...savedNote,
        createdAt: new Date(savedNote.createdAt),
        updatedAt: new Date(savedNote.updatedAt),
        ai_content: savedNote.ai_content
      });
      
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully",
      });
    }
  };

  // Add tag to current note
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag from current note
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Export note as markdown
  const exportNote = () => {
    if (!activeNote) return;
    
    // Create markdown content
    let markdown = `# ${noteTitle}\n\n`;
    
    if (tags.length > 0) {
      markdown += `Tags: ${tags.join(', ')}\n\n`;
    }
    
    markdown += noteContent;
    
    // Include AI-generated content when available
    if (aiResponse?.summary) {
      markdown += `\n\n## Summary\n\n${aiResponse.summary}`;
    }
    
    if (aiResponse?.keyConcepts && aiResponse.keyConcepts.length > 0) {
      markdown += `\n\n## Key Concepts\n\n`;
      aiResponse.keyConcepts.forEach(concept => {
        markdown += `### ${concept.concept}\n\n${concept.description}\n\n`;
      });
    }
    
    if (aiResponse?.flashcards && aiResponse.flashcards.length > 0) {
      markdown += `\n\n## Flashcards\n\n`;
      aiResponse.flashcards.forEach((card, index) => {
        markdown += `### Card ${index + 1}\n\n**Question:** ${card.question}\n\n**Answer:** ${card.answer}\n\n`;
      });
    }
    
    if (aiResponse?.mindmap && aiResponse.mindmap.nodes && aiResponse.mindmap.nodes.length > 0) {
      markdown += `\n\n## Mind Map\n\n`;
      
      // Add main node
      const mainNode = aiResponse.mindmap.nodes.find(n => n.id === 'main');
      if (mainNode) {
        markdown += `Central Topic: **${mainNode.label}**\n\n`;
      }
      
      // Add connected concepts
      markdown += `Connected Concepts:\n\n`;
      aiResponse.mindmap.nodes.filter(node => node.id !== 'main').forEach(node => {
        markdown += `- ${node.label}\n`;
      });
    }
    
    // Create a blob with the markdown content
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Note Exported",
      description: "Your note has been exported as a Markdown file with all AI content included",
    });
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Handle share note functionality
  const handleShareNote = () => {
    if (!activeNote) return;
    
    // In a real app, this would generate a shareable link
    // For now, simulate copy to clipboard
    
    navigator.clipboard.writeText(
      `${window.location.origin}/notes?shared=${activeNote.id}\n\n` +
      `Note: ${noteTitle}\n\n${noteContent.substring(0, 150)}...`
    ).then(() => {
      toast({
        title: "Sharing Link Copied",
        description: "A link to share this note has been copied to your clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Error Sharing Note",
        description: "Failed to generate sharing link",
        variant: "destructive",
      });
    });
  };

  // Migrate existing notes to ensure AI content is properly saved
  const migrateNotesAIContent = async () => {
    if (!user || !dbInitialized) return;
    
    try {
      console.log('Starting notes AI content migration');
      // Use the migration utility function
      const migratedCount = await migrateNotesAIContent(user.id);
      
      if (migratedCount > 0) {
        toast({
          title: "Notes Updated",
          description: `${migratedCount} notes have been updated with AI content structure.`,
        });
        
        // Reload notes to get the updated content
        await loadNotes();
      }
    } catch (err) {
      console.error('Error during notes migration:', err);
      toast({
        title: "Migration Error",
        description: err instanceof Error ? err.message : "Failed to update notes structure",
        variant: "destructive",
      });
    }
  };

  // History Dialog Component
  const HistoryViewDialog = ({ open, onOpenChange, historyNote }) => {
    // Group AI content sections
    const hasAiContent = historyNote?.ai_content && (
      historyNote.ai_content.summary || 
      (historyNote.ai_content.keyConcepts && historyNote.ai_content.keyConcepts.length > 0) ||
      (historyNote.ai_content.flashcards && historyNote.ai_content.flashcards.length > 0) ||
      (historyNote.ai_content.mindmap && historyNote.ai_content.mindmap.nodes && historyNote.ai_content.mindmap.nodes.length > 0)
    );
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <History className="h-5 w-5 mr-2 text-indigo-500" />
                Note History: {historyNote?.historyTitle || 'Historical Version'}
              </div>
              <div className="text-sm text-gray-500">
                {historyNote && new Date(historyNote.historyTimestamp).toLocaleString()}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {historyNote ? (
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Content</h3>
                <div className="bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                  {historyNote.content}
                </div>
              </div>
              
              {historyNote.tags && historyNote.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {historyNote.tags.map((tag: string) => (
                      <Badge key={tag} className="bg-gray-100 text-gray-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {hasAiContent && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                    AI-Generated Content
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Summary */}
                    {historyNote.ai_content.summary && (
                      <Card className="col-span-2">
                        <CardHeader className="py-3">
                          <CardTitle className="text-md flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="bg-blue-50 p-3 rounded-md text-gray-800">
                            {historyNote.ai_content.summary}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Key Concepts */}
                    {historyNote.ai_content.keyConcepts && historyNote.ai_content.keyConcepts.length > 0 && (
                      <Card className="col-span-2">
                        <CardHeader className="py-3">
                          <CardTitle className="text-md flex items-center">
                            <Brain className="h-4 w-4 mr-2 text-green-500" />
                            Key Concepts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-2">
                            {historyNote.ai_content.keyConcepts.map((concept: any, idx: number) => (
                              <div key={idx} className="bg-green-50 p-3 rounded-md">
                                <div className="font-medium text-green-800">{concept.concept}</div>
                                <div className="text-gray-700 mt-1">{concept.description}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Flashcards */}
                    {historyNote.ai_content.flashcards && historyNote.ai_content.flashcards.length > 0 && (
                      <Card className="col-span-2">
                        <CardHeader className="py-3">
                          <CardTitle className="text-md flex items-center">
                            <List className="h-4 w-4 mr-2 text-amber-500" />
                            Flashcards
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-2">
                            {historyNote.ai_content.flashcards.map((card: any, idx: number) => (
                              <div key={idx} className="bg-amber-50 p-3 rounded-md">
                                <div className="font-medium text-amber-800">Q: {card.question}</div>
                                <Separator className="my-2" />
                                <div className="text-gray-700">A: {card.answer}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Mindmap */}
                    {historyNote.ai_content.mindmap && 
                     historyNote.ai_content.mindmap.nodes && 
                     historyNote.ai_content.mindmap.nodes.length > 0 && (
                      <Card className="col-span-2">
                        <CardHeader className="py-3">
                          <CardTitle className="text-md flex items-center">
                            <Network className="h-4 w-4 mr-2 text-purple-500" />
                            Mind Map
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="bg-purple-50 p-4 rounded-md">
                            {/* Simple mindmap visualization */}
                            <div className="flex flex-col items-center">
                              {/* Main node */}
                              <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-8 font-medium text-purple-800">
                                {historyNote.ai_content.mindmap.nodes.find((n: any) => n.id === 'main')?.label || 
                                  historyNote.title || 'Main Topic'}
                              </div>
                              
                              {/* Sub nodes */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                {historyNote.ai_content.mindmap.nodes
                                  .filter((node: any) => node.id !== 'main')
                                  .map((node: any, idx: number) => (
                                    <div key={idx} className="bg-white border rounded-lg p-3 shadow-sm text-center">
                                      {node.label}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setHistoryDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Restore this version if needed
                    if (window.confirm('Restore this version of the note?')) {
                      setNoteTitle(historyNote.title);
                      setNoteContent(historyNote.content);
                      setTags(historyNote.tags || []);
                      if (historyNote.ai_content) {
                        setAiResponse(historyNote.ai_content);
                      }
                      setHistoryDialogOpen(false);
                      toast({
                        title: "Historical Version Restored",
                        description: "Note content has been restored from history.",
                      });
                    }
                  }}
                >
                  Restore This Version
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-indigo-500" />
              <p>Loading history entry...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // New function to view note history in detail
  const viewNoteHistory = async (note: Note) => {
    setSelectedHistoryNote(note);
    
    // Load history for this note
    if (note && !note.id.startsWith('temp_')) {
      try {
        console.log('Loading history for note:', note.id);
        
        // Use direct query to get note history
        const { data, error } = await supabase
          .from('note_history')
          .select('*')
          .eq('user_id', user?.id)
          .eq('note_id', note.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Note history loaded:', data?.length || 0);
        setNoteHistory(data || []);
      } catch (err) {
        console.error('Error loading note history:', err);
        toast({
          title: "Error Loading History",
          description: "Failed to load history for this note.",
          variant: "destructive",
        });
      }
    }
    
    setShowNoteHistoryView(true);
  };

  // Add the NoteHistoryView component inside the render of NotesPage
  const NoteHistoryView = () => {
    if (!selectedHistoryNote) return null;
    
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-[#6566f1] p-4 flex items-center justify-between text-white">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteHistoryView(false)}
              className="mr-2 text-white hover:bg-[#5051d4]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              History: {selectedHistoryNote.title || 'Untitled Note'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!dbInitialized && (
              <Button
                variant="outline"
                onClick={initializeDatabaseTables}
                disabled={isProcessing}
                className="flex items-center text-sm bg-transparent border-white text-white hover:bg-[#5051d4]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Initialize Database
              </Button>
            )}
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => {
                selectNote(selectedHistoryNote);
                setShowNoteHistoryView(false);
              }}
              className="text-white hover:bg-[#5051d4] flex items-center"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Note
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tools')}
              className="text-white hover:bg-[#5051d4]"
            >
              <Zap className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* History Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-indigo-500" />
                Version History
              </h3>
              
              {noteHistory.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No history records found for this note.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noteHistory.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base font-medium">{entry.title}</CardTitle>
                          <div className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.ai_content && (
                            <>
                              {entry.ai_content.summary && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Summary
                                </Badge>
                              )}
                              {entry.ai_content.keyConcepts && entry.ai_content.keyConcepts.length > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-800">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Concepts ({entry.ai_content.keyConcepts.length})
                                </Badge>
                              )}
                              {entry.ai_content.flashcards && entry.ai_content.flashcards.length > 0 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800">
                                  <List className="h-3 w-3 mr-1" />
                                  Flashcards ({entry.ai_content.flashcards.length})
                                </Badge>
                              )}
                              {entry.ai_content.mindmap && entry.ai_content.mindmap.nodes && entry.ai_content.mindmap.nodes.length > 0 && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-800">
                                  <Network className="h-3 w-3 mr-1" />
                                  Mind Map
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewHistoryEntry(entry)}
                          >
                            View Content
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              // Restore this version if needed
                              if (window.confirm('Restore this version of the note?')) {
                                // Find the full note content if available
                                supabase
                                  .from('notes')
                                  .select('content')
                                  .eq('id', entry.note_id)
                                  .single()
                                  .then(({ data }) => {
                                    if (data) {
                                      setNoteTitle(entry.title);
                                      setNoteContent(data.content);
                                      if (entry.ai_content) {
                                        setAiResponse(entry.ai_content);
                                      }
                                      setShowNoteHistoryView(false);
                                      toast({
                                        title: "Historical Version Restored",
                                        description: "Note has been restored from history.",
                                      });
                                    }
                                  });
                              }
                            }}
                          >
                            Restore This Version
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h3 className="text-lg font-medium mb-4">Note Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Title</h4>
                  <p className="text-gray-900">{selectedHistoryNote.title || 'Untitled'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                  <p className="text-gray-900">{selectedHistoryNote.createdAt.toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
                  <p className="text-gray-900">{selectedHistoryNote.updatedAt.toLocaleString()}</p>
                </div>
                
                {selectedHistoryNote.tags && selectedHistoryNote.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedHistoryNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Main return with conditional rendering for history view
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <StickyNote className="w-5 h-5 text-indigo-500 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Smart Notes</h1>
            </div>
          </div>
          
          <div className="p-4">
            <Button 
              onClick={createNewNote}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
          
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <div className="px-4 mb-2 text-sm font-medium text-gray-500">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
            </div>
            <div className="space-y-1 px-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-2 rounded-md transition-colors ${
                    activeNote?.id === note.id && !showNoteHistoryView
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => selectNote(note)}
                >
                  <div className="font-medium truncate">{note.title || 'Untitled Note'}</div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()} · 
                    {note.content.length > 30
                      ? note.content.substring(0, 30) + '...'
                      : note.content}
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge variant="outline" key={tag} className="text-xs bg-gray-100">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-gray-100">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => viewNoteHistory(note)}
                    >
                      <Clock className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - conditionally render history view or note editor */}
      {showNoteHistoryView ? (
        <NoteHistoryView />
      ) : (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-[#6566f1] p-4 flex items-center justify-between text-white">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tools')}
              className="mr-2 text-white hover:bg-[#5051d4]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              Notes
            </h2>
            <div className="ml-2 text-sm">
              AI-powered study assistant
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!dbInitialized && (
              <Button
                variant="outline"
                onClick={initializeDatabaseTables}
                disabled={isProcessing}
                className="flex items-center text-sm bg-transparent border-white text-white hover:bg-[#5051d4]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Initialize Database
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white hover:bg-[#5051d4]"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
          </div>
        </header>

        {/* Note Editor */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {activeNote ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="w-full">
                  <Input
                    type="text"
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} className="bg-indigo-100 text-indigo-800">
                        {tag}
                        <button
                          className="ml-1 text-indigo-600 hover:text-indigo-900"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <div className="flex items-center">
                      <Input
                        type="text"
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag();
                          }
                        }}
                        className="h-7 text-sm min-w-[80px] max-w-[120px]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addTag}
                        className="h-7 px-2"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full bg-gray-100">
                    <TabsTrigger value="editor" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="ai-tools" className="flex-1">
                      <Brain className="w-4 h-4 mr-2" />
                      AI Tools
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="flex-1">
                      <List className="w-4 h-4 mr-2" />
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger value="mindmap" className="flex-1">
                      <Network className="w-4 h-4 mr-2" />
                      Mind Map
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="space-y-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleRecording}
                            className={`flex items-center justify-center ${
                              isRecording ? 'text-red-500 border-red-500' : ''
                            }`}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="w-4 h-4 mr-2" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4 mr-2" />
                                Record Audio
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated:{' '}
                          {activeNote.updatedAt.toLocaleString()}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Start typing your note..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="min-h-[300px] p-4 focus-visible:ring-0 border"
                      />
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="ai-tools">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Button
                          onClick={() => processWithAI(noteContent, 'summary')}
                          className="flex items-center justify-center gap-2"
                          disabled={isProcessing || !noteContent.trim()}
                          variant="outline"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          Generate Summary
                        </Button>
                        <Button
                          onClick={() => processWithAI(noteContent, 'concepts')}
                          className="flex items-center justify-center gap-2"
                          disabled={isProcessing || !noteContent.trim()}
                          variant="outline"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                          Extract Key Concepts
                        </Button>
                      </div>

                      {/* AI response display */}
                      <div className="space-y-4">
                        {/* Summary */}
                        {aiResponse?.summary && (
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
                              Summary
                            </h3>
                            <p className="text-gray-800">{aiResponse.summary}</p>
                          </div>
                        )}

                        {/* Key Concepts */}
                        {aiResponse?.keyConcepts && aiResponse.keyConcepts.length > 0 && (
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                              <Brain className="h-4 w-4 mr-2 text-indigo-600" />
                              Key Concepts
                            </h3>
                            <div className="space-y-3">
                              {aiResponse.keyConcepts.map((concept, idx) => (
                                <div key={idx} className="bg-white p-3 rounded shadow-sm">
                                  <h4 className="font-medium text-indigo-700">
                                    {concept.concept}
                                  </h4>
                                  <p className="text-gray-700 text-sm mt-1">
                                    {concept.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="flashcards">
                    <CardContent className="p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Study Flashcards
                        </h3>
                        {!aiResponse?.flashcards && (
                          <Button
                            onClick={() => processWithAI(noteContent, 'flashcards')}
                            className="flex items-center gap-2"
                            disabled={isProcessing || !noteContent.trim()}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileQuestion className="h-4 w-4" />
                            )}
                            Generate Flashcards
                          </Button>
                        )}
                      </div>

                      {aiResponse?.flashcards && aiResponse.flashcards.length > 0 ? (
                        <div className="space-y-4">
                          {aiResponse.flashcards.map((card, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Question {idx + 1}:
                                </h4>
                                <p className="text-gray-800 mb-4">{card.question}</p>
                                <Separator />
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Answer:
                                  </h4>
                                  <p className="text-gray-800">{card.answer}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-500 mb-2">
                            No Flashcards Yet
                          </h4>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Generate flashcards to help you study this material more
                            effectively.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="mindmap">
                    <CardContent className="p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Mind Map Visualization
                        </h3>
                        {!aiResponse?.mindmap?.nodes || aiResponse.mindmap.nodes.length <= 1 ? (
                          <Button
                            onClick={() => processWithAI(noteContent, 'mindmap')}
                            className="flex items-center gap-2"
                            disabled={isProcessing || !noteContent.trim()}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Network className="h-4 w-4" />
                            )}
                            Generate Mind Map
                          </Button>
                        ) : null}
                      </div>

                      {aiResponse?.mindmap?.nodes && aiResponse.mindmap.nodes.length > 1 ? (
                        <div className="bg-gray-50 p-4 rounded-lg min-h-[300px] border">
                          {/* Simple mind map visualization */}
                          <div className="flex flex-col items-center">
                            {/* Main node */}
                            <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3 mb-8 font-medium text-indigo-800">
                              {aiResponse.mindmap.nodes.find(n => n.id === 'main')?.label || noteTitle || 'Main Topic'}
                            </div>
                            
                            {/* Sub nodes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                              {aiResponse.mindmap.nodes
                                .filter(node => node.id !== 'main')
                                .map((node, idx) => (
                                  <div key={idx} className="bg-white border rounded-lg p-3 shadow-sm text-center">
                                    {node.label}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Network className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-500 mb-2">
                            No Mind Map Yet
                          </h4>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Generate a mind map to visualize the relationships between
                            concepts in your notes.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={saveNote}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this note?')) {
                        deleteNote(activeNote.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={exportNote}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareNote}
                    className="flex items-center"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={() => {
                      loadCurrentNoteHistory();
                      setShowHistory(true);
                    }}
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-12">
              <StickyNote className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Create Your First Note
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating a new note or select an existing one from the sidebar.
              </p>
              <Button
                onClick={createNewNote}
                className="flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          )}
        </main>
      </div>
      )}

      {/* History Dialog */}
      <HistoryViewDialog 
        open={historyDialogOpen} 
        onOpenChange={setHistoryDialogOpen} 
        historyNote={viewingHistoryNote} 
      />
      
      {/* Note History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-indigo-500" />
              Note History
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {noteHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No history available for this note
              </div>
            ) : (
              <div className="space-y-2">
                {noteHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-100 rounded-md border border-gray-100"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}{' '}
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.ai_content && (
                          <>
                            {entry.ai_content.summary && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Summary
                              </Badge>
                            )}
                            {entry.ai_content.keyConcepts && entry.ai_content.keyConcepts.length > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-800 text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                Concepts ({entry.ai_content.keyConcepts.length})
                              </Badge>
                            )}
                            {entry.ai_content.flashcards && entry.ai_content.flashcards.length > 0 && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 text-xs">
                                <List className="h-3 w-3 mr-1" />
                                Flashcards ({entry.ai_content.flashcards.length})
                              </Badge>
                            )}
                            {entry.ai_content.mindmap && entry.ai_content.mindmap.nodes && entry.ai_content.mindmap.nodes.length > 0 && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-800 text-xs">
                                <Network className="h-3 w-3 mr-1" />
                                Mind Map
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => viewHistoryEntry(entry)}
                      className="ml-2"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;