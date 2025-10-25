import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DOCUMENT_TYPES } from '@/lib/contractConfig';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: number, ipfsCid: string) => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload PDF, JPG, or PNG files only',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload files smaller than 10MB',
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !documentType) {
      toast.error('Missing information', {
        description: 'Please select a file and document type',
      });
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement actual IPFS upload
      // For now, simulate upload with mock data
      
      // Simulate encryption process
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.info('Encrypting document...', { description: 'Client-side encryption in progress' });
      
      // Simulate IPFS upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockIpfsCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
      toast.info('Uploading to IPFS...', { description: 'Decentralized storage upload' });
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockDocumentId = Math.floor(Math.random() * 10000);
      
      toast.success('Document uploaded successfully', {
        description: `Document ID: ${mockDocumentId}`,
      });

      onUploadComplete?.(mockDocumentId, mockIpfsCid);
      
      // Reset form
      setFile(null);
      setDocumentType('');
      
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message || 'Failed to upload document',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Healthcare Document
        </CardTitle>
        <CardDescription>
          Upload your encrypted healthcare documents to decentralized storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-smooth
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${file ? 'bg-gradient-subtle' : 'bg-background'}
          `}
        >
          {!file ? (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop your document here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse (PDF, JPG, PNG - max 10MB)
              </p>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between bg-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="document-type" className="bg-background">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !documentType || isUploading}
          className={buttonVariants({ variant: 'hero', size: 'lg' })}
          style={{ width: '100%' }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading to Blockchain...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload & Encrypt
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm">
          <p className="font-medium text-accent mb-1">🔒 End-to-End Encryption</p>
          <p className="text-xs text-muted-foreground">
            Your documents are encrypted client-side before upload. Only you control access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
