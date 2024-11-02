
const CONFIG = {
  RECOMPILE_DELAY: 1500,  
  CHECK_INTERVAL: 1000,   
  MIN_CHANGE_LENGTH: 1,  
  SELECTOR: {
    EDITOR: '.cm-content',
    RECOMPILE_BTN: '.split-menu-button',
    COMPILE_ERROR: '.alert-danger'
  }
};

let recompileTimeout = null;
let lastCompileTime = 0;
let lastContent = '';

function canRecompile() {
  const now = Date.now();
  if (now - lastCompileTime > CONFIG.RECOMPILE_DELAY) {
    lastCompileTime = now;
    return true;
  }
  return false;
}

function hasContentChanged(editorContainer) {
  const currentContent = editorContainer.textContent;
  if (currentContent !== lastContent) {
    const changes = currentContent.length - lastContent.length;
    if (Math.abs(changes) >= CONFIG.MIN_CHANGE_LENGTH) {
      lastContent = currentContent;
      return true;
    }
  }
  return false;
}

function triggerRecompile(editorContainer) {
  if (!canRecompile() || !hasContentChanged(editorContainer)) {
    return;
  }

  const recompileButton = document.querySelector(CONFIG.SELECTOR.RECOMPILE_BTN);
  if (recompileButton && !recompileButton.disabled) {
    recompileButton.click();
  }
}


function observeEditor() {

  const editorContainer = document.querySelector(CONFIG.SELECTOR.EDITOR);
  if (!editorContainer) return;


  lastContent = editorContainer.textContent;

  const observer = new MutationObserver((mutations) => {

    const hasMeaningfulChanges = mutations.some(mutation => {

      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        return false;
      }

      if (mutation.type === 'characterData' && !mutation.target.textContent.trim()) {
        return false;
      }
      return true;
    });

    if (hasMeaningfulChanges) {

      clearTimeout(recompileTimeout);
      

      recompileTimeout = setTimeout(() => {
        triggerRecompile(editorContainer);
      }, CONFIG.RECOMPILE_DELAY);
    }
  });

  observer.observe(editorContainer, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });

 
}


function init() {

  const checkEditor = setInterval(() => {
    const editor = document.querySelector(CONFIG.SELECTOR.EDITOR);
    if (editor) {
      clearInterval(checkEditor);
      observeEditor();
    }
  }, CONFIG.CHECK_INTERVAL);
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}