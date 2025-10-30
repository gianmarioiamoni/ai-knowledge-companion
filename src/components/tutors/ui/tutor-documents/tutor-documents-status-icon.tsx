import { 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import type { JSX } from 'react';

interface TutorDocumentsStatusIconProps {
  status?: string;
}

export function TutorDocumentsStatusIcon({ status }: TutorDocumentsStatusIconProps): JSX.Element {
  switch (status) {
    case 'processed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
}
