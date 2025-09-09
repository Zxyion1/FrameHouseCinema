// This file contains JavaScript code to handle the functionality of the website, including navigation between pages and dynamic loading of images based on the selected section.


// Simple homepage slideshow for .image-gallery
document.addEventListener('DOMContentLoaded', () => {
    const imageGallery = document.getElementById('image-gallery');
    if (!imageGallery) return;

    // Add your favorite images here (add/remove as needed)
    const images = [
        'Media/architecture/IMG_4218.JPG',
        'Media/architecture/IMG_4561.JPG',
        'Media/architecture/IMG_5321.JPG',
        'Media/scenery/IMG_3210.JPG',
        'Media/scenery/IMG_0489.JPG',
        'Media/scenery/IMG_2764.JPG',
        'Media/people/IMG_1499.JPG',
        'Media/people/IMG_4889.JPG',
        'Media/people/IMG_4925.JPG',
        'Media/lighting/IMG_0705.JPG',
        'Media/lighting/IMG_3498.JPG',
        'Media/lighting/IMG_3541.JPG'
    ];

    let current = 0;
    const img = document.createElement('img');
    img.src = images[current];
    img.alt = 'Slideshow image';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    imageGallery.appendChild(img);

    setInterval(() => {
        current = (current + 1) % images.length;
        img.src = images[current];
    }, 2500);
});