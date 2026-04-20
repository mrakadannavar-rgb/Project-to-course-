const modules = [
    "Module-1-Introduction-and-Setup.md",
    "Module-2-Reverse-Engineering-and-Constants.md",
    "Module-3-The-Core-API-Client.md",
    "Module-4-Managing-Projects.md",
    "Module-5-Media-Generation.md",
    "Module-6-Building-the-CLI.md"
];

const navContainer = document.getElementById('module-nav');
const contentDiv = document.getElementById('content');

// Initialize navigation
function initNav() {
    modules.forEach((mod, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-link';
        // Clean up the name
        const displayName = mod.replace(/-/g, ' ').replace('.md', '');
        btn.textContent = displayName;
        btn.onclick = () => loadModule(mod, btn);
        navContainer.appendChild(btn);
    });
}

// Load markdown content
async function loadModule(filename, btnElement) {
    // Update active state
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Fetch and render
    try {
        contentDiv.style.opacity = '0';
        
        const response = await fetch(`modules/${filename}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const markdown = await response.text();
        const html = marked.parse(markdown);
        
        setTimeout(() => {
            contentDiv.innerHTML = html;
            contentDiv.classList.remove('fade-in');
            void contentDiv.offsetWidth; // trigger reflow
            contentDiv.classList.add('fade-in');
            contentDiv.style.opacity = '1';
        }, 150);

    } catch (error) {
        contentDiv.innerHTML = `<h2 style="color: #ef4444;">Error loading module</h2><p>${error.message}</p>`;
        contentDiv.style.opacity = '1';
    }
}

// Setup
initNav();
