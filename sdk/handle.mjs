const readScript = (script) => typeof script === 'function'
    ? `const selector=args[0]||'';const index=args[1]||0;const extra=args.slice(2);const readNodes=()=>{const items=[];const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_ELEMENT);for(let node=walker.currentNode;node;node=walker.nextNode())items.push(node);return items;};const readText=node=>(node.textContent||'').replace(/\\s+/g,' ').trim();const readName=node=>{const value=node.getAttribute('aria-label')||node.getAttribute('title')||node.getAttribute('placeholder')||node.value||'';if(value)return value.trim();const id=node.getAttribute('aria-labelledby')||node.id||'';const label=id?document.getElementById(id):null;return label?readText(label):readText(node);};const readList=()=>!selector.startsWith('::-p-')||!selector.endsWith(')')?Array.from(document.querySelectorAll(selector||'body')):readNodes().filter(node=>selector.startsWith('::-p-text(')?readText(node).includes(selector.slice(selector.indexOf('(')+1,-1).trim()):readName(node).includes(selector.slice(selector.indexOf('(')+1,-1).trim()));const node=readList()[index||0];if(!node)throw new Error(\`No element matches \${selector}\`);return (${script.toString()})(node,...extra);`
    : `${script}`;

export class ElementHandle {
    constructor(locator) {
        this.locator = locator;
        this.page = locator.page;
    }
    click(options = {}) {
        return this.locator.click(options);
    }
    fill(value, options = {}) {
        return this.locator.fill(value, options);
    }
    press(key, options = {}) {
        return this.locator.press(key, options);
    }
    evaluate(script, ...args) {
        return this.page.evaluate(readScript(script), this.locator.selector, this.locator.index || 0, ...args);
    }
    html(options = {}) {
        return this.locator.html(options);
    }
    data(options = {}) {
        return this.locator.data(options);
    }
    screenshot(options = {}) {
        return this.locator.screenshot(options);
    }
    uploadFile(files, options = {}) {
        return this.locator.uploadFile(files, options);
    }
}
