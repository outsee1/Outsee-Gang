import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phone = "5519989067693";
  const message = encodeURIComponent("Olá Outsee, poderia me tirar uma dúvida?");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center bg-[hsl(142,70%,40%)] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-100 active:scale-95"
      style={{ opacity: 0.65, borderRadius: "50%" }}
      aria-label="Conversar no WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppButton;
