// src/utils/cropImage.js
export default function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Handles CORS
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Make sure crop width/height are integers
      const cropWidth = Math.round(crop.width);
      const cropHeight = Math.round(crop.height);

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped area
      ctx.drawImage(
        image,
        Math.round(crop.x),
        Math.round(crop.y),
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Canvas is empty'));
        }

        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg', 1);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
