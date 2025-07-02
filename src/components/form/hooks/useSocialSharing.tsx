import { toast } from 'sonner';

export const useSocialSharing = () => {
  const shareToSocial = (platform: string, hasAudio: boolean) => {
    if (!hasAudio) {
      toast.error('Generate audio first to share');
      return;
    }
    
    const shareText = `Check out my AI-generated podcast from my LinkedIn profile! 🎧 #PodcastGeneration #AI`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    }
  };

  return { shareToSocial };
};