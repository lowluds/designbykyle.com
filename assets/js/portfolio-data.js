/**
 * Portfolio Data
 * Easy-to-manage portfolio projects data
 * Simply add, edit, or remove projects here!
 */

const portfolioData = [
    {
      id: 1,
      title: "ASP - All Solutions Printing",
      description:
        "Brand refresh for a commercial print shop. New logo, color system, and usage guidelines that signal reliability and eco‑friendly values across signage, packaging, and web.",
      image: "assets/images/project/project1.jpg",
      category: "branding",
      tags: ["Brand Identity", "Logo", "Guidelines", "Print & Web"],
      projectUrl: "work/asp-printing/",
      demoUrl: "demo/asp-printing/",
      codeUrl:
        "https://github.com/lowluds/designbykyle.com/tree/master/work1/ASP",
      featured: true,
      year: "2024",
    },
    {
      id: 2,
      title: "HYE - The Pilates",
      description:
        "Mobile‑first website for a Pilates studio with clear class offerings, social proof, and a simple inquiry flow designed to drive bookings and repeat visits.",
      image: "assets/images/project/project5.jpg",
      category: "web",
      tags: ["Local Services", "Bookings", "Responsive", "SEO Ready"],
      projectUrl: "work/hye-pilates/",
      demoUrl: "demo/hye-pilates/",
      codeUrl:
        "https://github.com/lowluds/designbykyle.com/tree/master/demos/hye",
      featured: true,
      year: "2025",
    },
    {
      id: 3,
      title: "Flask Auth App",
      description:
        "Secure authentication module for business appsm. Email/password login, role‑based access, admin controls, and protected areas to keep data safe.",
      image: "assets/images/project/project3.jpg",
      category: "fullstack",
      tags: ["Security", "User Accounts", "Admin", "Compliance"],
      projectUrl: "https://auth-flask-iblb.onrender.com/login",
      demoUrl: "https://auth-flask-iblb.onrender.com/login",
      codeUrl: "https://github.com/lowluds/python-basic-port-scanner",
      featured: false,
      year: "2023",
    },
    {
      id: 4,
      title: "Pine Ink - Tattoo Studio",
      description:
        "Portfolio and booking site for a tattoo studio. Artist profiles, searchable galleries, and a request‑to‑book form that converts visitors into consultations.",
      image: "assets/images/project/project4.jpg",
      category: "web",
      tags: ["Portfolio", "Booking", "Local Business", "Lead Capture"],
      projectUrl: "https://pineinktattoo.vercel.app",
      demoUrl: "https://pineinktattoo.vercel.app",
      codeUrl: "https://github.com/lowluds/pineinktattoo",
      featured: true,
      year: "2025",
    },
  {
      id: 5,
      title: "G2Own Platform",
      description:
        "Homepage concept for a gaming platform featuring bold dark UI, focused messaging, and subtle motion to strengthen brand presence and encourage sign‑ups.",
      image: "assets/images/project/project2.jpg",
      category: "web",
      tags: ["Landing Page", "Branding", "Animation", "UI/UX"],
      projectUrl: "work/g2own-platform/",
      demoUrl: "demo/g2own-platform/",
      codeUrl:
        "https://github.com/lowluds/designbykyle.com/tree/master/work2/g2own_home",
      featured: false,
      year: "2024",
    },
    {
      id: 6,
      title: "OSHEL - House of Fashion",
      description:
        "Interactive photo wall and gallery demo with smooth animations, lightbox viewing, and a fully responsive layout.",
      image: "demo/oshel/img/logo.png",
      category: "web",
      tags: ["Gallery", "Animation", "Responsive", "Demo"],
      projectUrl: "work/oshel/",
      demoUrl: "demo/oshel/",
      codeUrl:
        "https://github.com/lowluds/designbykyle.com/tree/master/demo/oshel",
      featured: false,
      year: "2025",
    },
  ];
  

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioData;
}

// Make available globally for direct HTML usage
window.portfolioData = portfolioData;
