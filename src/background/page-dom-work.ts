import { readPageHtmlTarget } from '@/src/background/page-html-read';
import { runPageScript } from '@/src/background/page-script-read';
import { readSelectTarget } from '@/src/background/page-select-read';
import { submitPageTarget } from '@/src/background/page-submit-read';
import { waitForPageTarget } from '@/src/background/page-wait-read';
import { PageAction } from '@/src/shared/page-action';

export const runPageDomAction = async (action: PageAction) => {
    if (action.type === 'wait_for_selector') return waitForPageTarget(action.selector || '', action.index || 0, Boolean(action.visible), action.timeoutMs || 30000, 200);
    if (action.type === 'get_page_html') return readPageHtmlTarget(action.selector || 'html', action.index || 0);
    if (action.type === 'execute_script') return runPageScript(action.script || '', action.args || []);
    if (action.type === 'select_option') return readSelectTarget(action.selector || '', action.value || '', action.index || 0);
    if (action.type === 'submit') return submitPageTarget(action.selector || '', action.index || 0);
    throw new Error(`DOM action ${action.type} is not available.`);
};
