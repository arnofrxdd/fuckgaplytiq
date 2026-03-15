/**
 * This function was adapted from the one in the react-easy-crop's documentation
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues
    image.src = url
  })

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * @param {string} imageSrc - Image File url or base64
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 * @param {Object} flip - optional flip parameter
 * @param {string} shape - 'original', 'circle', 'rounded', 'hexagon', 'diamond'
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  shape = 'original'
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const resultCanvas = document.createElement('canvas')
  const resultCtx = resultCanvas.getContext('2d')

  resultCanvas.width = pixelCrop.width
  resultCanvas.height = pixelCrop.height

  // If shape is original, use white background and JPEG (faster/smaller)
  // Otherwise use PNG for transparency
  const isShaped = shape !== 'original';
  
  if (!isShaped) {
    resultCtx.fillStyle = 'white'
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height)
  }

  // Apply Clipping Path based on shape
  if (isShaped) {
    resultCtx.beginPath();
    const w = resultCanvas.width;
    const h = resultCanvas.height;

    if (shape === 'circle') {
      resultCtx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
    } else if (shape === 'rounded') {
      const r = Math.min(w, h) * 0.2; // 20% border radius
      resultCtx.moveTo(r, 0);
      resultCtx.lineTo(w - r, 0);
      resultCtx.quadraticCurveTo(w, 0, w, r);
      resultCtx.lineTo(w, h - r);
      resultCtx.quadraticCurveTo(w, h, w - r, h);
      resultCtx.lineTo(r, h);
      resultCtx.quadraticCurveTo(0, h, 0, h - r);
      resultCtx.lineTo(0, r);
      resultCtx.quadraticCurveTo(0, 0, r, 0);
    } else if (shape === 'hexagon') {
      const s = Math.min(w, h);
      resultCtx.moveTo(s / 2, 0);
      resultCtx.lineTo(s, s / 4);
      resultCtx.lineTo(s, 3 * s / 4);
      resultCtx.lineTo(s / 2, s);
      resultCtx.lineTo(0, 3 * s / 4);
      resultCtx.lineTo(0, s / 4);
      resultCtx.closePath();
    } else if (shape === 'diamond') {
      resultCtx.moveTo(w / 2, 0);
      resultCtx.lineTo(w, h / 2);
      resultCtx.lineTo(w / 2, h);
      resultCtx.lineTo(0, h / 2);
      resultCtx.closePath();
    }
    resultCtx.clip();
  }

  resultCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return resultCanvas.toDataURL(isShaped ? 'image/png' : 'image/jpeg');
}
