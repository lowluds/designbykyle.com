/**
 * Portfolio Data
 * Easy-to-manage portfolio projects data
 * Simply add, edit, or remove projects here!
 */

const portfolioData = [
    {
        id: 1,
        title: "ASP All Solutions Printing",
        description: "Professional branding and logo design for printing company with clean, eco-friendly visual identity.",
        image: "assets/images/project/project1.jpg",
        category: "branding",
        tags: ["Branding", "Logo Design", "Illustrator", "Web Design"],
        projectUrl: "work/asp-printing/",
        demoUrl: "demo/asp-printing/",
        codeUrl: "https://github.com/lowluds/designbykyle.com/tree/master/work1/ASP",
        featured: true,
        year: "2024"
    },
    {
        id: 2,
        title: "G2Own Platform",
        description: "Sleek gaming platform interface with modern dark design, animated particles, and clean typography.",
        image: "assets/images/project/project2.jpg",
        category: "web",
        tags: ["React", "CSS3", "Animation", "UI/UX"],
        projectUrl: "work/g2own-platform/",
        demoUrl: "demo/g2own-platform/",
        codeUrl: "https://github.com/lowluds/designbykyle.com/tree/master/work2/g2own_home",
        featured: true,
        year: "2024"
    },
    {
        id: 3,
        title: "Flask Auth App",
        description: "Flask-based authentication system with user management, secure login, and admin features.",
        image: "assets/images/project/project3.jpg",
        category: "fullstack",
        tags: ["Python", "Flask", "Authentication", "Security"],
        projectUrl: "https://auth-flask-iblb.onrender.com/login",
        demoUrl: "https://auth-flask-iblb.onrender.com/login",
        codeUrl: "https://github.com/lowluds/python-basic-port-scanner",
        featured: false,
        year: "2023"
    },
    {
        id: 4,
        title: "Pine Ink Tattoo Studio",
        description: "Modern tattoo studio website built with Next.js, featuring artist galleries, booking system, and stunning visual design.",
        image: "assets/images/project/project4.jpg",
        category: "web",
        tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        projectUrl: "https://pineinktattoo.vercel.app",
        demoUrl: "https://pineinktattoo.vercel.app",
        codeUrl: "https://github.com/lowluds/pineinktattoo",
        featured: true,
        year: "2024"
    },
    {
        id: 5,
        title: "HYE — The Pilates",
        description: "Elegant Pilates studio website featuring Instagram-style mobile mockup, animated testimonials, and modern responsive design with Tailwind CSS.",
        image: "assets/images/project/project5.jpg",
        category: "web",
        tags: ["HTML5", "Tailwind CSS", "JavaScript", "Responsive Design"],
        projectUrl: "work/hye-pilates/",
        demoUrl: "demo/hye-pilates/",
        codeUrl: "https://github.com/lowluds/designbykyle.com/tree/master/demos/hye",
        featured: true,
        year: "2024"
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioData;
}

// Make available globally for direct HTML usage
window.portfolioData = portfolioData;
