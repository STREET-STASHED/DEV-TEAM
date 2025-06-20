const Footer = () => {
  return (
    <footer className="bg-black text-gold text-sm py-8 px-6 text-center mt-20 border-t border-yellow-600 shadow-inner">
      <p className="tracking-wide font-semibold">&copy; {new Date().getFullYear()} STREETSTASHED™. All rights reserved.</p>
      <p className="text-xs text-yellow-500 mt-2 italic">Powered by culture. Built for the streets. Delivered with luxury.</p>
    </footer>
  );
};

export default Footer;