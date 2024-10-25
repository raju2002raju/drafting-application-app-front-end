// Footer.jsx
export const Footer = () => {
    return (
      <footer className="text-center text-gray-500 text-sm mt-8">
        <div className="flex items-center justify-center mb-2">
          <img src="/Images/footerImage.png" alt="Vaqalat" className="h-7 mr-2" />
          © 2024 Drafting Application All rights reserved |{" "}
          <a href="#" className="ml-1 hover:underline">Privacy Policy</a> |{" "}
          <a href="#" className="mx-1 hover:underline">Terms of Service</a> |{" "}
          <a href="#" className="ml-1 hover:underline">Contact Us</a>
        </div>
        <p>Designed with care to streamline your document drafting process.</p>
      </footer>
    );
  };