/**
 * Multimedia Page - Audio/Video/Image Management
 * Sprint 5: Audio support (active), Video/Image (coming soon)
 */

import { AuthGuard } from "@/components/auth/auth-guard";
import { MultimediaPageClient } from "@/components/multimedia/pages/multimedia-page-client";

export default function MultimediaPage() {
  return (
    <AuthGuard>
      <MultimediaPageClient />
    </AuthGuard>
  );
}

