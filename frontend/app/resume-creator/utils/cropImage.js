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

  if (!ctx) return null

  const rotRad = getRadianAngle(rotation)

  // Step 1: Normalize the image (rotation/flip) onto a temporary canvas
  // We use the bounding box to ensure the entire rotated image fits
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Transform around the center of the bounding box
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0)

  // Step 2: Extract the crop from the normalized canvas
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) return null

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.imageSmoothingEnabled = true
  croppedCtx.imageSmoothingQuality = 'high'

  // Fill white for square crops (avoiding black edges if zoom < 1)
  const isShaped = shape !== 'original' && shape !== 'square'
  if (!isShaped) {
    croppedCtx.fillStyle = 'white'
    croppedCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height)
  }

  // Apply shape mask if needed
  if (isShaped && shape === 'circle') {
    const w = pixelCrop.width
    const h = pixelCrop.height
    croppedCtx.beginPath()
    croppedCtx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI)
    croppedCtx.clip()
  }

  // Draw the desired area from the normalized canvas to the final canvas
  croppedCtx.drawImage(
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

  return croppedCanvas.toDataURL(isShaped ? 'image/png' : 'image/jpeg')
}
