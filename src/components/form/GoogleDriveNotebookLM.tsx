import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, RefreshCw, Play, Pause, Download, Share2, Eye, EyeOff, ExternalLink, FolderOpen, Music } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PDFUploadZone } from './PDFUploadZone';

interface AudioFile {
  id: string;
  file_name: string;
  source_pdf: string | null;
  supabase_url: string | null;
  uploaded_at: string;
  is_published: boolean;
  metadata: any;
}

interface GoogleDriveNotebookLMProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

export const GoogleDriveNotebookLM: React.FC<GoogleDriveNotebookLMProps> = ({ 
  onAudioGenerated 
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Load audio files on component mount
  useEffect(() => {
    loadAudioFiles();
    checkGoogleConnection();
  }, []);

  // Audio event handlers
  useEffect(() => {
    audio.onended = () => setPlayingAudio(null);
    audio.onpause = () => setPlayingAudio(null);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  const checkGoogleConnection = async () => {
    // Check if user has connected Google Drive
    // This would typically check for stored OAuth tokens
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // For now, assume connection exists if user is authenticated
      setIsGoogleConnected(true);
    }
  };

  const loadAudioFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAudioFiles(data || []);
    } catch (error) {
      console.error('Error loading audio files:', error);
      toast.error('Failed to load audio files');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('PDF file must be less than 100MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      // Trigger Google Drive OAuth flow
      const response = await supabase.functions.invoke('google-drive-auth', {
        body: { action: 'connect' }
      });

      if (response.error) throw response.error;

      // Open OAuth URL in new window
      if (response.data?.authUrl) {
        window.open(response.data.authUrl, '_blank', 'width=500,height=600');
        
        // Listen for OAuth completion
        const checkAuth = setInterval(async () => {
          const { data } = await supabase.functions.invoke('google-drive-auth', {
            body: { action: 'check_status' }
          });
          
          if (data?.connected) {
            clearInterval(checkAuth);
            setIsGoogleConnected(true);
            toast.success('Google Drive connected successfully!');
          }
        }, 1000);

        // Clear interval after 30 seconds
        setTimeout(() => clearInterval(checkAuth), 30000);
      }
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      toast.error('Failed to connect Google Drive');
    }
  };

  const uploadPdfToDrive = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!isGoogleConnected) {
      toast.error('Please connect Google Drive first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(pdfFile);
      });

      setUploadProgress(30);

      // Upload to Google Drive via edge function
      const response = await supabase.functions.invoke('google-drive-upload', {
        body: {
          fileName: pdfFile.name,
          fileData: base64,
          mimeType: 'application/pdf',
          folder: 'Lovable_PDFs'
        }
      });

      if (response.error) throw response.error;

      setUploadProgress(100);
      toast.success(`PDF uploaded to Google Drive: ${pdfFile.name}`);
      
      // Clear file selection
      setPdfFile(null);
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF to Google Drive');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const syncAudioFiles = async () => {
    if (!isGoogleConnected) {
      toast.error('Please connect Google Drive first');
      return;
    }

    setIsSyncing(true);

    try {
      const response = await supabase.functions.invoke('google-drive-sync', {
        body: { action: 'sync_audio' }
      });

      if (response.error) throw response.error;

      const newFiles = response.data?.newFiles || 0;
      
      if (newFiles > 0) {
        toast.success(`Synced ${newFiles} new audio file(s) from Google Drive`);
        await loadAudioFiles();
        
        // Trigger callback if new audio was found
        if (onAudioGenerated && audioFiles.length > 0) {
          const latestAudio = audioFiles[0];
          if (latestAudio.supabase_url) {
            onAudioGenerated(latestAudio.supabase_url);
          }
        }
      } else {
        toast.info('No new audio files found in Google Drive');
      }

    } catch (error) {
      console.error('Error syncing audio files:', error);
      toast.error('Failed to sync audio files from Google Drive');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleAudioPlayback = (audioFile: AudioFile) => {
    if (!audioFile.supabase_url) {
      toast.error('Audio file not available');
      return;
    }

    if (playingAudio === audioFile.id) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.src = audioFile.supabase_url;
      audio.play();
      setPlayingAudio(audioFile.id);
    }
  };

  const togglePublishStatus = async (audioFile: AudioFile) => {
    try {
      const { error } = await supabase
        .from('audio_files')
        .update({ is_published: !audioFile.is_published })
        .eq('id', audioFile.id);

      if (error) throw error;

      toast.success(`Audio ${audioFile.is_published ? 'unpublished' : 'published'} successfully`);
      await loadAudioFiles();

    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const downloadAudio = (audioFile: AudioFile) => {
    if (!audioFile.supabase_url) {
      toast.error('Audio file not available');
      return;
    }

    const link = document.createElement('a');
    link.href = audioFile.supabase_url;
    link.download = audioFile.file_name;
    link.click();
    toast.success('Audio download started');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Google Drive + NotebookLM Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload PDFs to Google Drive, process them in NotebookLM, and sync the generated audio back to your app
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Drive Connection */}
          {!isGoogleConnected ? (
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>Connect your Google Drive to get started:</p>
                  <Button onClick={connectGoogleDrive} variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Google Drive
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                ✅ Google Drive connected! You can now upload PDFs and sync audio files.
              </AlertDescription>
            </Alert>
          )}

          {/* Workflow Instructions */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Workflow:</strong></p>
                <ol className="list-decimal list-inside ml-2 space-y-1 text-sm">
                  <li>Upload PDF to Google Drive using the form below</li>
                  <li>Open <a href="https://notebooklm.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NotebookLM</a> and import the PDF from "Lovable_PDFs" folder</li>
                  <li>Generate audio overview in NotebookLM</li>
                  <li>Save the audio to "Lovable_Audio" folder in Google Drive</li>
                  <li>Click "Sync Audio Files" below to pull the audio into your app</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Step 1: Upload PDF to Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PDFUploadZone 
            onFileUpload={handleFileUpload}
            isExtracting={isUploading}
            uploadProgress={uploadProgress}
          />
          
          {pdfFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{pdfFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <Button 
                onClick={uploadPdfToDrive}
                disabled={isUploading || !isGoogleConnected}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Drive
                  </>
                )}
              </Button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Step 2: Sync Audio Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              After generating audio in NotebookLM and saving to "Lovable_Audio" folder, sync the files here.
            </p>
            
            <Button 
              onClick={syncAudioFiles} 
              disabled={isSyncing || !isGoogleConnected}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Audio Files...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Audio Files from Google Drive
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Files Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Your Audio Files ({audioFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {audioFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No audio files found. Upload a PDF and generate audio in NotebookLM to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {audioFiles.map((audioFile) => (
                <div key={audioFile.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Button
                    onClick={() => toggleAudioPlayback(audioFile)}
                    size="sm"
                    variant="outline"
                    className="rounded-full w-10 h-10"
                    disabled={!audioFile.supabase_url}
                  >
                    {playingAudio === audioFile.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <p className="font-medium">{audioFile.file_name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {audioFile.source_pdf && (
                        <span>Source: {audioFile.source_pdf}</span>
                      )}
                      <span>{new Date(audioFile.uploaded_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        audioFile.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {audioFile.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => togglePublishStatus(audioFile)}
                      size="sm"
                      variant="outline"
                    >
                      {audioFile.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {audioFile.supabase_url && (
                      <Button
                        onClick={() => downloadAudio(audioFile)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};