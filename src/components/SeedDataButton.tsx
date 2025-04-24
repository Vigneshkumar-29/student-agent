import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import seedTestData from '@/utils/seedTestData';
import { Loader2, Database } from 'lucide-react';

interface SeedDataButtonProps {
  userId: string;
  onSuccess: () => Promise<void>;
}

const SeedDataButton: React.FC<SeedDataButtonProps> = ({ userId, onSuccess }) => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You need to be signed in to seed test data.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSeeding(true);
      toast({
        title: "Generating test data",
        description: "Creating sample data to populate your dashboard...",
      });

      const result = await seedTestData(userId);
      
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
      console.error("Error seeding test data:", error);
      toast({
        title: "Error",
        description: "Failed to seed test data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSeedData}
      disabled={isSeeding}
      className="flex items-center gap-2"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      <span>Generate Test Data</span>
    </Button>
  );
};

export default SeedDataButton; 