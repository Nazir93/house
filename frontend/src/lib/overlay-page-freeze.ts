/** Ставит на паузу медиа на странице, пока открыт полноэкранный оверлей (поиск). */
export function pausePageMediaForOverlay(root: ParentNode = document): void {
  root.querySelectorAll("video").forEach((video) => {
    if (!video.paused) video.pause();
  });
}
