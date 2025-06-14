
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to get my podcast?",
    answer: "The entire process is automated and typically takes between 5-15 minutes. You'll receive an email with your files as soon as they're ready.",
  },
  {
    question: "Can I use my own voice?",
    answer: "Yes! With our 'Custom AI Voice Cloning' add-on, you can upload a short sample of your voice, and our AI will create a digital clone to narrate your podcast for a truly personal touch.",
  },
  {
    question: "Where can I share my podcast?",
    answer: "We provide you with an RSS feed and direct links to major platforms like Spotify, Apple Podcasts, and Google Podcasts. You also get social media clips perfect for LinkedIn, TikTok, and Instagram.",
  },
  {
    question: "What if I don't like the result?",
    answer: "While our AI is highly advanced, we understand you might want tweaks. We offer one free revision where you can provide feedback on the script or tone, and we'll regenerate the episode for you.",
  },
  {
    question: "Is this cheating on my resume?",
    answer: "Not at all! Think of it as a modern, dynamic cover letter. All the content is based on your actual resume and achievements. It's just a more engaging way to tell your professional story."
  }
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Frequently Asked Questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
