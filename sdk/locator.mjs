import { runAction } from './action.mjs';
import { ElementHandle } from './handle.mjs';

export class Locator {
    constructor(page, selector, index = 0) {
        this.index = index;
        this.page = page;
        this.selector = selector;
    }
    click(options = {}) {
        return runAction(this.page, { ...options, index: options.index || this.index || 0, selector: this.selector, type: 'click' });
    }
    fill(value, options = {}) {
        return runAction(this.page, { ...options, clearFirst: options.clearFirst || options.clearFirst === false ? options.clearFirst : true, index: options.index || this.index || 0, selector: this.selector, type: 'type_text', value });
    }
    press(key, options = {}) {
        return runAction(this.page, { ...options, index: options.index || this.index || 0, key, selector: this.selector, type: 'send_key' });
    }
    wait(options = {}) {
        return runAction(this.page, { ...options, index: options.index || this.index || 0, selector: this.selector, type: 'wait_for_selector', visible: options.visible || options.visible === false ? options.visible : true });
    }
    async waitHandle(options = {}) {
        await this.wait(options);
        return new ElementHandle(this);
    }
    html(options = {}) {
        return this.page.html(this.selector, { ...options, index: options.index || this.index || 0 });
    }
    data(options = {}) {
        return this.page.data(this.selector, options);
    }
    screenshot(options = {}) {
        return this.page.screenshot({ ...options, index: options.index || this.index || 0, selector: this.selector });
    }
    uploadFile(files, options = {}) {
        return runAction(this.page, { ...options, files, index: options.index || this.index || 0, selector: this.selector, type: 'upload_files' });
    }
}
