export class Locator {
    constructor(page, selector) {
        this.page = page;
        this.selector = selector;
    }
    click(options = {}) {
        return this.page.run([{ ...options, selector: this.selector, type: 'click' }]);
    }
    fill(value, options = {}) {
        return this.page.run([{ ...options, clearFirst: true, selector: this.selector, type: 'type_text', value }]);
    }
    press(key, options = {}) {
        return this.page.run([{ ...options, key, selector: this.selector, type: 'send_key' }]);
    }
    wait(options = {}) {
        const visible = Object.prototype.hasOwnProperty.call(options, 'visible') ? options.visible : true;
        return this.page.run([{ ...options, selector: this.selector, type: 'wait_for_selector', visible }]);
    }
    html(options = {}) {
        return this.page.html(this.selector, options);
    }
    data(options = {}) {
        return this.page.data(this.selector, options);
    }
    screenshot(options = {}) {
        return this.page.screenshot({ ...options, selector: this.selector });
    }
    uploadFile(files, options = {}) {
        return this.page.run([{ ...options, files, selector: this.selector, type: 'upload_files' }]);
    }
}
