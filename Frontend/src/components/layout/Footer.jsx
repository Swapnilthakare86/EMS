function Footer(){
  return(
    <footer className="bg-dark text-white text-center p-2 fixed-bottom shadow-sm app-footer">
      <small>© {new Date().getFullYear()} EMS</small>
    </footer>
  );
}

export default Footer;
