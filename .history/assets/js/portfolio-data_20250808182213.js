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
        image: "assets/images/project1.jpg",
        category: "branding",
        tags: ["Branding", "Logo Design", "Illustrator", "Web Design"],
        projectUrl: "demos/asp-printing/index.html",
        codeUrl: "https://github.com/lowluds/designbykyle.com/tree/master/work1/ASP",
        featured: true,
        year: "2024"
    },
    {
        id: 2,
        title: "G2Own Platform",
        description: "Sleek gaming platform interface with modern dark design, animated particles, and clean typography.",
        image: "assets/images/project2.jpg",
        category: "web",
        tags: ["React", "CSS3", "Animation", "UI/UX"],
        projectUrl: "https://github.com/lowluds/designbykyle.com/tree/master/work2/g2own_home",
        codeUrl: "https://github.com/lowluds/designbykyle.com/tree/master/work2/g2own_home",
        featured: true,
        year: "2024"
    },
    {
        id: 3,
        title: "Python Port Scanner",
        description: "Flask-based authentication system with user management, secure login, and admin features.",
        image: "assets/images/project3.jpg",
        category: "fullstack",
        tags: ["Python", "Flask", "Authentication", "Security"],
        projectUrl: "https://auth-flask-iblb.onrender.com/login",
        codeUrl: "https://github.com/lowluds/python-basic-port-scanner",
        featured: false,
        year: "2023"
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioData;
}

// Make available globally for direct HTML usage
window.portfolioData = portfolioData;
