import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowUp, ArrowDown, RefreshCw, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface RealtimeUpdate {
  id: string;
  type: 'quiz' | 'pdf' | 'image' | 'pdf_chat';
  title: string;
  time: Date;
}

interface DashboardRealTimeUpdatesProps {
  userId: string;
  onNewData: () => void;
}

export const DashboardRealTimeUpdates: React.FC<DashboardRealTimeUpdatesProps> = ({
  userId,
  onNewData
}) => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Setting up connection status tracker
    let connectionTimeout: ReturnType<typeof setTimeout>;
    let heartbeatInterval: ReturnType<typeof setInterval>;

    const checkConnection = () => {
      connectionTimeout = setTimeout(() => {
        setIsConnected(false);
      }, 10000);
    };

    // Start checking connection
    checkConnection();

    // Set up heartbeat to verify connection
    heartbeatInterval = setInterval(() => {
      // Ping Supabase to check connection
      supabase.auth.getSession()
        .then(() => {
          setIsConnected(true);
          clearTimeout(connectionTimeout);
          checkConnection();
        })
        .catch(() => setIsConnected(false));
    }, 30000);

    // Quiz subscription
    const quizSubscription = supabase
      .channel('dashboard_rt_quizzes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quizzes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          handleNewUpdate('quiz', payload.new);
        }
      )
      .subscribe(() => {
        setIsConnected(true);
        clearTimeout(connectionTimeout);
        checkConnection();
      });

    // PDF Analysis subscription
    const pdfSubscription = supabase
      .channel('dashboard_rt_pdfs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pdf_analyses',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          handleNewUpdate('pdf', payload.new);
        }
      )
      .subscribe();

    // Image Analysis subscription
    const imageSubscription = supabase
      .channel('dashboard_rt_images')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'image_analyses',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          handleNewUpdate('image', payload.new);
        }
      )
      .subscribe();

    // PDF Chat History subscription
    let pdfChatSubscription;
    let pdfChatAnalyticsSubscription;
    
    try {
      pdfChatSubscription = supabase
        .channel('dashboard_rt_pdf_chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pdf_chat_history',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            handleNewUpdate('pdf_chat', payload.new);
          }
        )
        .subscribe((status, error) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to pdf_chat_history');
          } else if (error) {
            console.warn('Error subscribing to pdf_chat_history:', error);
          }
        });

      // PDF Chat Analytics subscription
      pdfChatAnalyticsSubscription = supabase
        .channel('dashboard_rt_pdf_chat_analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pdf_chat_analytics',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Just trigger data refresh without toast notifications for updates
            if (payload.eventType === 'INSERT') {
              handleNewUpdate('pdf_chat', {
                id: payload.new.id,
                title: payload.new.title || `Chat: ${payload.new.file_name || 'Document'}`,
                file_name: payload.new.file_name
              });
            } else {
              setHasNewData(true);
              onNewData();
            }
          }
        )
        .subscribe((status, error) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to pdf_chat_analytics');
          } else if (error) {
            console.warn('Error subscribing to pdf_chat_analytics:', error);
          }
        });
    } catch (error) {
      console.warn('Error setting up PDF chat subscriptions:', error);
    }

    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(heartbeatInterval);
      quizSubscription.unsubscribe();
      pdfSubscription.unsubscribe();
      imageSubscription.unsubscribe();
      if (pdfChatSubscription) {
        pdfChatSubscription.unsubscribe();
      }
      if (pdfChatAnalyticsSubscription) {
        pdfChatAnalyticsSubscription.unsubscribe();
      }
    };
  }, [userId, onNewData]);

  const handleNewUpdate = (type: 'quiz' | 'pdf' | 'image' | 'pdf_chat', data: any) => {
    setHasNewData(true);
    onNewData();
    
    // Get appropriate title based on type
    let title = data.title || `New ${type.replace('_', ' ')} activity`;
    if (type === 'pdf_chat') {
      title = `Chat: ${data.file_name}`;
    }
    
    // Add to updates list
    setUpdates((prev) => [
      {
        id: data.id,
        type,
        title,
        time: new Date()
      },
      ...prev.slice(0, 4)
    ]);

    // Show toast notification
    const typeDisplay = type === 'pdf_chat' ? 'PDF Chat' : type.toUpperCase();
    toast({
      title: `New ${typeDisplay} Activity`,
      description: `${title} has been added to your dashboard`,
      variant: "default",
    });
  };

  const refreshData = () => {
    onNewData();
    setHasNewData(false);
  };

  if (updates.length === 0 && !hasNewData) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {hasNewData && (
        <Button 
          onClick={refreshData}
          className="mb-2 bg-primary shadow-lg flex items-center gap-2"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Dashboard</span>
        </Button>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-3 border max-w-xs w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Real-time Updates</h3>
          <Badge variant={isConnected ? "success" : "destructive"} className="text-xs">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {updates.map((update) => (
            <div key={update.id} className="text-xs bg-muted p-2 rounded flex items-center gap-2 animate-pulse">
              <span className="flex-shrink-0">
                {update.type === 'quiz' && <ArrowUp className="h-3 w-3 text-purple-500" />}
                {update.type === 'pdf' && <ArrowUp className="h-3 w-3 text-blue-500" />}
                {update.type === 'image' && <ArrowUp className="h-3 w-3 text-amber-500" />}
                {update.type === 'pdf_chat' && <MessageSquare className="h-3 w-3 text-green-500" />}
              </span>
              <span className="flex-1 truncate">{update.title}</span>
              <span className="text-gray-400 flex-shrink-0">
                {new Date(update.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardRealTimeUpdates; 