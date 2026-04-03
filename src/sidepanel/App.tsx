import { ClassPanel } from '@/src/sidepanel/components/ClassPanel';
import { SettingsPanel } from '@/src/sidepanel/components/SettingsPanel';
import { Toolbar } from '@/src/sidepanel/components/Toolbar';
import { TreePane } from '@/src/sidepanel/components/TreePane';
import { StylePanel } from '@/src/sidepanel/components/StylePanel';
import { readStructureMarks } from '@/src/sidepanel/lib/structure-diff';
import { useDomCompare } from '@/src/sidepanel/state/useDomCompare';
import { useRemoteSettings } from '@/src/sidepanel/state/useRemoteSettings';
import { useState } from 'react';

const App = () => {
    const state = useDomCompare();
    const remote = useRemoteSettings();
    const [showSettings, setShowSettings] = useState(false);
    const rightMarks = readStructureMarks(state.leftSnapshot.tree, state.rightSnapshot.tree);
    const openInTab = () => chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
    const showOpenInTab = window.location.protocol !== 'chrome-extension:' || !window.location.pathname.endsWith('/sidepanel.html');
    return (
        <main className="app-shell">
            <Toolbar leftTabId={state.leftTabId} rightTabId={state.rightTabId} selector={state.selector} loading={state.loading} showOpenInTab={showOpenInTab} tabs={state.tabs} onInspect={state.inspect} onRefresh={state.refreshTabs} onLeftTabChange={state.setLeftTabId} onRightTabChange={state.setRightTabId} onSelectorChange={state.setSelector} onOpenInTab={openInTab} onToggleSettings={() => setShowSettings((value) => !value)} />
            {state.error ? <div className="banner error">{state.error}</div> : null}
            {!state.error && state.loading ? <div className="banner">Reading DOM and computed styles from both tabs.</div> : null}
            {showSettings ? <SettingsPanel loading={remote.loading} message={remote.message} saving={remote.saving} settings={remote.settings} onChange={remote.update} onSave={remote.save} /> : null}
            <section className="compare-grid">
                <div className="stack">
                    <TreePane title="Left tree" root={state.leftSnapshot.tree} marks={{}} selectedPath={state.selectedPath} onSelect={(path) => void state.selectPath(path)} />
                    <ClassPanel title="Left classes" detail={state.leftDetail} other={state.rightDetail} />
                    <StylePanel title="Left computed styles" detail={state.leftDetail} other={state.rightDetail} />
                </div>
                <div className="stack">
                    <TreePane title="Right tree" root={state.rightSnapshot.tree} marks={rightMarks} selectedPath={state.selectedPath} onSelect={(path) => void state.selectPath(path)} />
                    <ClassPanel title="Right classes" detail={state.rightDetail} other={state.leftDetail} />
                    <StylePanel title="Right computed styles" detail={state.rightDetail} other={state.leftDetail} />
                </div>
            </section>
        </main>
    );
};

export default App;
