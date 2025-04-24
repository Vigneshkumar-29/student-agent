import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Mic,
  Volume2,
  StopCircle,
  Loader2,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Plus,
  History as HistoryIcon,
  Send,
  Home,
  ChevronLeft,
  Settings,
  Sparkles,
  Clock,
  UserCircle, 
  Bot,
  Menu,
  X,
  MessageSquare,
  HelpCircle,
  Share2,
  Download,
  Save,
  Search
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/components/ui/use-toast";
import { analyzeImage } from "@/lib/openai";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  user_id: string;
  image_url: string;
  image_base64: string;
  created_at: string;
  messages: Message[];
}

const ImageQA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    // Scroll chat to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && user && image) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      const timeout = setTimeout(() => {
        saveConversation();
      }, 3000);
      setAutoSaveTimeout(timeout);
    }
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [messages, user, image]);

  const loadConversations = async () => {
    try {
      if (!user) {
        console.error('No user found');
        return;
      }
      
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('image_conversations')
        .select(`
          id,
          user_id,
          image_url,
          image_base64,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      if (!conversationsData) {
        setConversations([]);
        return;
      }

      // Fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('image_messages')
            .select('question, answer, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages for conversation:', conv.id, messagesError);
            return {
              ...conv,
              messages: []
            };
          }

          // Convert to Message format
          const formattedMessages = messagesData ? messagesData.map(msg => ([
            { role: 'user', content: msg.question },
            { role: 'assistant', content: msg.answer }
          ])).flat() : [];

          return {
            ...conv,
            messages: formattedMessages
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  };

  const startNewConversation = () => {
    setImage(null);
    setImageUrl('');
    setImageBase64('');
    setMessages([]);
    setZoom(1);
    setRotation(0);
    setCurrentConversationId(null);
    setQuestion('');
    setShowHistory(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveConversation = async () => {
    if (!user || !image || messages.length === 0) return;
    
    try {
      let conversationId = currentConversationId;
      
      // Create new conversation if needed
      if (!conversationId) {
        const { data: conversationData, error: conversationError } = await supabase
          .from('image_conversations')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            image_base64: imageBase64,
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        
        conversationId = conversationData.id;
        setCurrentConversationId(conversationId);
      }

      // Get user questions and AI answers as pairs
      const messagePairs = [];
      for (let i = 0; i < messages.length; i += 2) {
        if (i + 1 < messages.length) {
          messagePairs.push({
            question: messages[i].content,
            answer: messages[i + 1].content,
            conversation_id: conversationId
          });
        }
      }

      // Delete existing messages if any
      await supabase
        .from('image_messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Insert new messages
      if (messagePairs.length > 0) {
        const { error: messagesError } = await supabase
          .from('image_messages')
          .insert(messagePairs);

        if (messagesError) throw messagesError;
      }

      toast({
        title: "Conversation saved",
        description: "Your conversation has been saved to history."
      });
      
      // Refresh conversations list
      loadConversations();
      
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive",
      });
    }
  };

  const loadConversation = async (conversation: Conversation) => {
    try {
      setCurrentConversationId(conversation.id);
      setMessages(conversation.messages);
      setShowHistory(false);
      setImageUrl(`data:image/jpeg;base64,${conversation.image_base64}`);
      setImageBase64(conversation.image_base64);
      
      // Create a new File object from the base64 image
      const response = await fetch(`data:image/jpeg;base64,${conversation.image_base64}`);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      setImage(file);
      
      toast({
        title: "Conversation loaded",
        description: "Successfully loaded previous conversation"
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the conversation load
    
    try {
      // Delete all messages first (foreign key constraint)
      const { error: messagesError } = await supabase
        .from('image_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('image_conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If current conversation was deleted, reset the state
      if (currentConversationId === conversationId) {
        startNewConversation();
      }

      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from history."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size too large. Please upload an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadProgress(10);
      
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setImage(file);
          setImageUrl(URL.createObjectURL(file));
          setMessages([{
            role: 'assistant',
            content: "I've analyzed your image. What would you like to know about it?"
          }]);
          setZoom(1);
          setRotation(0);
          setUploadProgress(70);
          
          // Convert to base64 for storage
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            setImageBase64(base64);
            setUploadProgress(100);
          }
          
          toast({
            title: "Success",
            description: "Image uploaded successfully!",
          });
        };
        img.onerror = () => {
          setUploadProgress(0);
          toast({
            title: "Error",
            description: "Failed to load image. Please try another file.",
            variant: "destructive",
          });
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        setUploadProgress(0);
        toast({
          title: "Error",
          description: "Failed to read image file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Error",
        description: "Please upload a valid image file (PNG, JPG, JPEG, or GIF)",
        variant: "destructive",
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAskQuestion = async () => {
    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    // Add user question to messages
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    const userQuestion = question;
    setQuestion('');
    setIsLoading(true);
    
    try {
      // If we don't have base64 yet, generate it
      let base64ForAnalysis = imageBase64;
      if (!base64ForAnalysis) {
        base64ForAnalysis = await convertImageToBase64(image);
        setImageBase64(base64ForAnalysis);
      }
      
      const response = await analyzeImage(base64ForAnalysis, userQuestion);
      
      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      toast({
        title: "Analysis complete",
        description: "AI has analyzed your image",
        variant: "default",
      });
    } catch (error) {
      console.error('Error processing request:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}`
          : "Sorry, I encountered an error while analyzing the image. Please try again." 
      }]);
      
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          if (!base64String) {
            reject(new Error('Failed to convert image to base64'));
            return;
          }
          resolve(base64String);
        } catch (error) {
          reject(new Error('Failed to process image'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // Image manipulation functions
  const clearImage = () => {
    startNewConversation();
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send this blob to a speech-to-text service
        // For now, we'll just simulate it
        setQuestion("What can you tell me about this image?");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Text-to-speech functions
  const playAnswer = (text: string) => {
    if (text && !isPlaying) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      };
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopPlaying = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
      {/* Professional header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/tools')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-xl">Image Analysis</h1>
              <p className="text-xs text-purple-200">AI-powered visual understanding</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10"
              onClick={startNewConversation}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '280px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 h-[calc(100vh-8rem)] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search analyses..."
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={startNewConversation}
                  >
                    <Plus className="h-4 w-4 mr-2 text-gray-500" />
                    New Analysis
                  </Button>
                  
                  {conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <div key={conv.id} className="group relative">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left truncate pr-10 text-sm hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => loadConversation(conv)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="truncate">
                            {conv.messages.length > 0 && conv.messages[0].role === 'user' 
                              ? conv.messages[0].content.substring(0, 25) + '...' 
                              : 'Image analysis'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <HistoryIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No analysis history yet</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/tools')}>
                    <Home className="h-4 w-4 mr-2" />
                    Back to Tools
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content area */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-8rem)]">
            {!image ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="max-w-md w-full mx-auto">
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Image</h2>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Get instant analysis and answers about any image with our AI assistant
                    </p>
                  </div>
                  
                  <Card className="bg-white shadow-xl border-0 overflow-hidden">
                    <div
                      {...getRootProps()}
                      className="flex flex-col items-center gap-4 p-8 cursor-pointer border-2 border-dashed border-indigo-200 rounded-lg hover:border-indigo-400 transition-all duration-300 m-4"
                    >
                      <input {...getInputProps()} ref={fileInputRef} />
                      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-medium text-gray-900 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PNG, JPG, JPEG, GIF (max 10MB)
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50/50 p-4 border-t border-indigo-100">
                      <div className="flex items-center gap-2 text-sm text-indigo-800">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        <span>Our AI can analyze your image and answer questions about it</span>
                      </div>
                    </div>
                  </Card>
                  
                  {conversations.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Recently analyzed images</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {conversations.slice(0, 3).map((conv) => (
                          <div
                            key={conv.id}
                            className="aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative"
                            onClick={() => loadConversation(conv)}
                          >
                            <img
                              src={`data:image/jpeg;base64,${conv.image_base64}`}
                              alt="Analyzed image"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <Button size="sm" variant="default" className="bg-white text-gray-800 hover:bg-indigo-100">
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {conversations.length > 3 && (
                        <div className="text-center mt-3">
                          <Button variant="link" onClick={() => setShowHistory(true)} className="text-indigo-600">
                            View all analyses
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                {/* Image Info Banner */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{image.name || 'Uploaded image'}</h3>
                      <Progress value={uploadProgress} className="w-32 h-1.5 mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => saveConversation()}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  {/* Image panel */}
                  <div className="md:col-span-1 bg-white rounded-xl shadow-md p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Image View</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-600 hover:text-indigo-600"
                          onClick={() => handleZoom(0.1)}
                          title="Zoom In"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-600 hover:text-indigo-600"
                          onClick={() => handleZoom(-0.1)}
                          title="Zoom Out"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-600 hover:text-indigo-600"
                          onClick={rotateImage}
                          title="Rotate"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                      <div
                        className="relative"
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="Uploaded image"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat panel */}
                  <div className="md:col-span-2 flex flex-col">
                    {/* Chat Messages */}
                    <div 
                      className="flex-1 bg-white rounded-xl shadow-md p-4 mb-4 overflow-y-auto"
                      ref={chatContainerRef}
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <Bot className="h-8 w-8 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Ask questions about your image
                          </h3>
                          <p className="text-gray-600 max-w-md">
                            I've processed your image. Go ahead and ask me anything about what's in it!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex gap-3 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-indigo-600" />
                                </div>
                              )}
                              
                              <div
                                className={`rounded-2xl p-4 max-w-[75%] ${
                                  message.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                {message.role === 'assistant' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => isPlaying ? stopPlaying() : playAnswer(message.content)}
                                    className="ml-1 h-6 w-6 inline-flex hover:bg-gray-200 rounded-full"
                                    title={isPlaying ? "Stop speaking" : "Listen"}
                                  >
                                    {isPlaying ? (
                                      <StopCircle className="h-3.5 w-3.5 text-indigo-600" />
                                    ) : (
                                      <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                                    )}
                                  </Button>
                                )}
                              </div>
                              
                              {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                                  <UserCircle className="h-4 w-4 text-indigo-600" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                          
                          {isLoading && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="bg-gray-100 rounded-2xl p-4 w-16">
                                <div className="flex space-x-1.5">
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Question Input */}
                    <div className="bg-white rounded-xl shadow-md p-3 relative">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about your image..."
                        className="pr-20 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isLoading}
                        onKeyPress={handleKeyPress}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          onClick={() => isRecording ? stopRecording() : startRecording()}
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-indigo-600'}`}
                          disabled={isLoading}
                        >
                          {isRecording ? (
                            <StopCircle className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={handleAskQuestion}
                          disabled={!question.trim() || isLoading}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-8 w-8 p-0 rounded-full"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          ) : (
                            <Send className="h-3.5 w-3.5 text-white" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-2xl">
                <HistoryIcon className="w-6 h-6 text-indigo-600" />
                Analysis History
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No analysis history yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card
                      className="overflow-hidden hover:shadow-md cursor-pointer transition-all duration-200 relative"
                      onClick={() => loadConversation(conv)}
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={`data:image/jpeg;base64,${conv.image_base64}`}
                          alt="Analyzed image"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white hover:bg-white/20"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {new Date(conv.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-indigo-600 font-medium">
                            {conv.messages.length / 2} questions
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {conv.messages.length > 0 && conv.messages[0].role === 'user' 
                            ? conv.messages[0].content 
                            : 'Image analysis'}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageQA;