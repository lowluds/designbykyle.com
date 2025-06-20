// After creating the preview icons, let's ensure they all have the same background style
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const previewIcons = document.querySelectorAll('.preview-icon');
        previewIcons.forEach(icon => {
            icon.style.background = '#000000';
            icon.style.backgroundColor = '#000000';
            icon.style.backgroundImage = 'none';
        });
    }, 500);
});