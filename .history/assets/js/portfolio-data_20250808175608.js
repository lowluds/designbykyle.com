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
        projectUrl: "https://github.com/lowluds/asp-printing",
        codeUrl: "https://github.com/lowluds/asp-printing",
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
        projectUrl: "https://github.com/lowluds/g2own-platform",
        codeUrl: "https://github.com/lowluds/g2own-platform",
        featured: true,
        year: "2024"
    },
    {
        id: 3,
        title: "Python Port Scanner",
        description: "Basic network port scanner built with Python for security testing and network analysis.",
        image: "assets/images/project3.jpg",
        category: "fullstack",
        tags: ["Python", "Networking", "Security", "CLI Tool"],
        projectUrl: "https://github.com/lowluds/python-basic-port-scanner",
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
