export const preventAllEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

export const showTransparentOverlay = (loading) => {
    const el = document.getElementById('transparent-overlay');
    if (loading) {
        el.classList.add('loading');
    } else {
        el.classList.remove('loading');
    }
};