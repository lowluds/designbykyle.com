# 📁 Adding New Portfolio Projects

## 🎯 Super Easy Way to Add Projects!

Instead of editing the complex HTML, simply add your projects to the `assets/js/portfolio-data.js` file!

## 📝 How to Add a New Project

### **Step 1: Open the Portfolio Data File**
Open `assets/js/portfolio-data.js` in your code editor.

### **Step 2: Add Your Project**
Copy this template and add it to the `portfolioData` array:

```javascript
{
    id: 4, // Increment this number
    title: "Your Project Name",
    description: "Brief description of what this project does and the technologies used.",
    image: "assets/images/project4.jpg", // Add your image here
    category: "web", // Options: "web", "fullstack", "branding"
    tags: ["HTML", "CSS", "JavaScript", "React"], // Your tech stack
    projectUrl: "https://your-live-project-url.com",
    codeUrl: "https://github.com/lowluds/your-repo",
    featured: true, // true for featured badge, false for regular
    year: "2024" // Project year
}
```

### **Step 3: Save and Refresh**
- Save the file
- Refresh your website
- Your new project will automatically appear!

## 🎨 Project Categories

Choose the right category for filtering:

- **`"web"`** - Web applications, websites, frontend projects
- **`"fullstack"`** - Full-stack applications, backend + frontend
- **`"branding"`** - Logo design, branding, graphic design work

## 📸 Adding Project Images

1. **Save your project image** to `assets/images/`
2. **Name it** something like `project4.jpg`, `project5.jpg`, etc.
3. **Recommended size**: 800x500px (16:10 aspect ratio)
4. **Format**: JPG or PNG
5. **Update the `image` field** in your project data

## ✨ 3D Card Effects

Your projects will automatically get these cool effects:

- **🎯 Perspective rotation** on hover
- **📏 Layered depth** with different Z-translations
- **✨ Glowing borders** on interaction
- **🎭 Smooth animations** and transitions
- **🏷️ Featured badges** for important projects

## 🔧 Advanced Customization

### **Featured Projects**
Set `featured: true` to add a "Featured" badge to important projects.

### **Project Links**
- **`projectUrl`**: Link to live demo/website
- **`codeUrl`**: Link to GitHub repository
- Both links can be the same if you only have a repo

### **Tags**
Add relevant technologies, frameworks, or skills used:
```javascript
tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"]
```

## 📱 Example: Complete Project Entry

```javascript
{
    id: 4,
    title: "E-Commerce Dashboard",
    description: "Modern admin dashboard for e-commerce with real-time analytics, inventory management, and responsive design.",
    image: "assets/images/ecommerce-dashboard.jpg",
    category: "fullstack",
    tags: ["React", "Node.js", "MongoDB", "Chart.js", "Tailwind"],
    projectUrl: "https://dashboard-demo.yoursite.com",
    codeUrl: "https://github.com/lowluds/ecommerce-dashboard",
    featured: true,
    year: "2024"
}
```

## 🔄 Removing Projects

Simply delete the project object from the `portfolioData` array and save the file.

## 🎯 Portfolio Filters

The filter buttons automatically work with your categories:
- **All** - Shows all projects
- **Web Apps** - Shows `category: "web"`
- **Full Stack** - Shows `category: "fullstack"`  
- **Branding** - Shows `category: "branding"`

## ✅ Quick Checklist

- [ ] Added project to `portfolio-data.js`
- [ ] Uploaded project image to `assets/images/`
- [ ] Set correct category for filtering
- [ ] Added relevant tags
- [ ] Tested live project and GitHub links
- [ ] Saved file and refreshed website

---

**That's it!** No more editing complex HTML - just update the data file and your portfolio automatically updates with beautiful 3D card effects! 🌟
