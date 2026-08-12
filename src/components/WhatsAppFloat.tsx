import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppFloat() {
  const message = encodeURIComponent("Hello Duchessot Airbnb and Apartment.\nI am interested in one of your properties.\nCan you assist me?");
  const whatsappUrl = `https://wa.me/233542242404?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors hover:scale-110 active:scale-95"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
