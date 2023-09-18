// handle add overlay background color
// by inject css into  the active tab
export const removeOverLayerBg = () => {
  const video = document.querySelector('video')
  const overlayEle = document.getElementById('youtube-quick-note-overlay')
  if (overlayEle) {
    overlayEle.addEventListener('click', () => {
      console.log(overlayEle)
      // overlayEle.remove()
      // if (video && video.paused) {
      //   video.play()
      // }
    })
  }
}
