import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import createDatabaseTables from '@/utils/createTables';
import { Loader2, Database } from 'lucide-react';

interface SetupDatabaseButtonProps {
  onSuccess: () => Promise<void>;
}

const SetupDatabaseButton: React.FC<SetupDatabaseButtonProps> = ({ onSuccess }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTables = async () => {
    try {
      setIsCreating(true);
      toast({
        title: "Setting up database",
        description: "Creating necessary tables for the dashboard...",
      });

      const result = await createDatabaseTables();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh the dashboard data
        await onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error setting up database:", error);
      toast({
        title: "Error",
        description: "Failed to set up database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCreateTables}
      disabled={isCreating}
      className="flex items-center gap-2"
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      <span>Setup Database</span>
    </Button>
  );
};

export default SetupDatabaseButton; 