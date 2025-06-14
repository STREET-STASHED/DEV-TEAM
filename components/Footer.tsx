const Footer = () => {
  return (
    <footer className="bg-black text-white text-sm py-6 px-4 text-center mt-10 border-t border-gray-800">
      <p>&copy; {new Date().getFullYear()} StreetStashed. All rights reserved.</p>
      <p className="text-xs text-gray-500 mt-1">Powered by culture. Built for the streets.</p>
    </footer>
  );
};

export default Footer;