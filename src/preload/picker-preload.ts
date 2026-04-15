/**
 * Preload for the X11 screen share source picker window.
 */
export {};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer, contextBridge } =
	require('electron') as typeof import('electron');

contextBridge.exposeInMainWorld('pickerAPI', {
	getSources: () => ipcRenderer.invoke('screen-share:get-sources'),
	pickSource: (sourceId: string | null) =>
		ipcRenderer.send('screen-share:pick-source', sourceId),
});
