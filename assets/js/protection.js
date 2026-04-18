// document.addEventListener('DOMContentLoaded', () => {
//     document.addEventListener('contextmenu', event => event.preventDefault());
//     document.querySelectorAll('img, a').forEach(el => {
//         el.setAttribute('draggable', 'false');
//         el.addEventListener('dragstart', e => e.preventDefault());
//     });
//     document.addEventListener('copy', event => event.preventDefault());
//     document.addEventListener('cut', event => event.preventDefault());
//     document.addEventListener('keydown', event => {
//         if (event.code === 'F12') event.preventDefault();
//         if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'C' || event.key === 'c')) event.preventDefault();
//         if (event.ctrlKey && (event.key === 'U' || event.key === 'u' || event.key === 'P' || event.key === 'p' || event.key === 'S' || event.key === 's')) event.preventDefault();
//         if (event.metaKey && event.altKey && (event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'U' || event.key === 'u')) event.preventDefault();
//     });
//     const style = document.createElement('style');
//     style.innerHTML = '* { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; -webkit-user-drag: none !important; } input, textarea, [contenteditable="true"] { -webkit-user-select: auto !important; -moz-user-select: auto !important; -ms-user-select: auto !important; user-select: auto !important; } img { pointer-events: none !important; }';
//     document.head.appendChild(style);
// });