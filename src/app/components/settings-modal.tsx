import { useState, useEffect } from 'react';
import { User, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { getUserProfile, saveUserProfile } from '@/app/services/user-profile';
import { toast } from 'sonner';
import {
  trackSettingsModalOpened,
  trackSettingsModalClosed,
  trackProfileTabViewed,
  trackProfileSaved,
  trackProfileCancelled,
  trackProfileTextEdited,
  resetProfileEditedTracking,
} from '@/app/services/analytics';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [profile, setProfile] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [initialProfile, setInitialProfile] = useState('');

  // Load profile when modal opens
  useEffect(() => {
    if (open) {
      const savedProfile = getUserProfile();
      setProfile(savedProfile);
      setInitialProfile(savedProfile);
      setIsSaved(false);
      
      // Track modal opened and profile tab viewed
      trackSettingsModalOpened();
      const hasExistingProfile = savedProfile && savedProfile.trim().length > 0;
      trackProfileTabViewed(hasExistingProfile);
      
      // Reset the profile edited tracking flag for this session
      resetProfileEditedTracking();
    }
  }, [open]);

  // Track when modal is closed (including X button and outside click)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // Modal is being closed
      trackSettingsModalClosed();
      resetProfileEditedTracking();
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const hadExistingProfile = initialProfile && initialProfile.trim().length > 0;
    saveUserProfile(profile);
    setIsSaved(true);
    toast.success('Profile saved successfully!');
    
    // Track save with metadata about whether this was an update or create
    trackProfileSaved(hadExistingProfile);
    
    // Reset the "Saved" indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleCancel = () => {
    trackProfileCancelled();
    handleOpenChange(false);
  };

  const handleProfileTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfile(e.target.value);
    // Track text edited only once per session
    trackProfileTextEdited();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your PromptStash preferences
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="profile-text">Your Profile</Label>
                <p className="text-sm text-muted-foreground">
                  This profile is added to every prompt you send. Use it to describe who you are, your role, preferences, or context.
                </p>
                <Textarea
                  id="profile-text"
                  value={profile}
                  onChange={handleProfileTextChange}
                  placeholder="e.g., I am a senior software engineer with 10 years of experience in full-stack development. I prefer concise, technical explanations with code examples. I work primarily with React, TypeScript, and Node.js."
                  className="resize-none h-[300px]"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t px-6 py-4 bg-background">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}