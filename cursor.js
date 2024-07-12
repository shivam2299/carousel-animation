const cursor = document.querySelector(".cursor");
const cursorSize = 63;
const moveCursor = (e) => {
  const translateX = e.clientX - cursorSize / 2;
  const translateY = e.clientY - cursorSize / 2;
  cursor.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
};
window.addEventListener("mousemove", moveCursor);
