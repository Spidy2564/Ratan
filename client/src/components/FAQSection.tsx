import { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    id: "copyright",
    question: "Can I use copyrighted anime characters?",
    answer: "While we understand the love for anime characters, we recommend using original artwork or designs you have permission to use. For personal use, fan art is generally acceptable, but for commercial purposes or bulk orders, we recommend using non-copyrighted designs or obtaining proper licenses. We can provide guidance on creating anime-inspired designs that don't infringe on copyrights."
  },
  {
    id: "materials",
    question: "What materials are the shirts made from?",
    answer: "Our t-shirts come in various premium fabrics. Regular t-shirts are made from 100% combed ring-spun cotton (180 GSM) for softness and durability. Oversized t-shirts use a heavier 220 GSM cotton blend for a relaxed drape. Our polo shirts feature a cotton-polyester blend with moisture-wicking properties. All fabrics are pre-shrunk and optimal for vibrant anime design printing."
  },
  {
    id: "shipping",
    question: "How long does it take to deliver?",
    answer: "Domestic shipping within India takes 3-5 business days after production (which takes 2-3 days for custom designs). International shipping can take 7-14 business days depending on the destination country. Express shipping options are available at checkout. All orders include tracking information and are packaged in protective materials to ensure your anime merchandise arrives in perfect condition."
  },
  {
    id: "cancel",
    question: "Can I cancel after uploading my design?",
    answer: "You can cancel your order within 2 hours of submission if the production hasn't started. Once we begin the printing process, cancellations aren't possible as we create each item on demand. However, if you're unhappy with the final product, we offer a satisfaction guarantee. Please contact our customer service team with your order details to discuss options."
  },
  {
    id: "design-positions",
    question: "Can I put designs on multiple positions of a shirt?",
    answer: "Yes! Our customization tool allows you to place designs on the front, back, both sleeves, and even the neck label. You can use different designs for each position or create a cohesive theme across all areas. Each position can be customized with different sizes and placements for truly unique anime merchandise that shows your fandom in creative ways."
  }
];

export default function FAQSection() {
  return (
    <section className="py-16 bg-gray-50 border-t border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-gray-600">
            Everything you need to know about our anime merchandise and customization services
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't see your question here? <a href="/contact" className="text-red-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
