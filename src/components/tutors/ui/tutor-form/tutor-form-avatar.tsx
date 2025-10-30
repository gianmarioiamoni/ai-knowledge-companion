import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JSX } from 'react';

interface TutorFormAvatarProps {
  name: string;
  avatarUrl?: string;
  initials: string;
  onAvatarUrlChange: (url: string) => void;
}

export function TutorFormAvatar({
  name,
  avatarUrl,
  initials,
  onAvatarUrlChange,
}: TutorFormAvatarProps): JSX.Element {
  return (
    <div className="lg:col-span-1">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Anteprima Avatar</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="avatar_url" className="text-sm font-medium">
            URL Avatar (opzionale)
          </Label>
          <Input
            id="avatar_url"
            type="url"
            value={avatarUrl}
            onChange={(e) => onAvatarUrlChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
