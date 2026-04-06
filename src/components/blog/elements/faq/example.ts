import type { FAQContent } from '@/types/content-elements'

export const faqExample: FAQContent = {
  title: 'Frequently asked questions',
  items: [
    {
      question: 'What is the return policy?',
      answer: 'You can return any item within 30 days of purchase for a full refund.',
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary based on location.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'Once your order is shipped, you will receive an email with a tracking number and a link to track your package.',
    },
    {
      question: 'Can I change or cancel my order?',
      answer:
        'Orders can be changed or canceled within 24 hours of placement. Please contact our support team as soon as possible.',
    },
    {
      question: 'Do you provide customer support?',
      answer:
        'Yes, our customer support team is available 24/7 via email, phone, and live chat to assist you with any inquiries.',
    },
  ],
}
