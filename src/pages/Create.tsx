
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { PodcastCreationForm } from '@/components/form/PodcastCreationForm';
import { PDFToTTS } from '@/components/form/PDFToTTS';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Create = () => {
    const { user, isLoading, isSignedIn } = useAuth();
    const navigate = useNavigate();
    const [extractedText, setExtractedText] = useState('');

    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            navigate('/auth');
        }
    }, [isSignedIn, isLoading, navigate]);

    if (isLoading || !isSignedIn) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute top-8 left-8">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div className="w-full max-w-4xl">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="create">Create Podcast</TabsTrigger>
                        <TabsTrigger value="tts">PDF to Speech</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="create">
                        <PodcastCreationForm initialResumeContent={extractedText} />
                    </TabsContent>
                    
                    <TabsContent value="tts">
                        <PDFToTTS onTextExtracted={setExtractedText} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Create;
