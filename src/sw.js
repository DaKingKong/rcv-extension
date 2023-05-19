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
        width: 200,
        height: 300,
    });
    await chrome.storage.local.set({
        popupWindowId: popup.id,
    });
    await chrome.storage.local.set({
        fromTabId: fromTab.id,
    });
}

chrome.action.onClicked.addListener(async function (tab) {
    openPopupWindow({ fromTab: tab });
});