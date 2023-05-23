async function openPopupWindow({ fromTab }) {
    console.log('open popup');
    const { popupWindowId } = await chrome.storage.local.get('popupWindowId');
    if (popupWindowId) {
        try {
            await chrome.windows.update(popupWindowId, { focused: true });
            return;
        } catch (e) {
            // ignore
        }
    }
    const popup = await chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 240,
        height: 300,
        focused: true
    });
    await chrome.storage.local.set({
        popupWindowId: popup.id,
    });
    await chrome.storage.local.set({
        fromTabId: fromTab.id,
    });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'openAuthPopup') {
        openPopupWindow({ fromTab: sender.tab });
    }
});