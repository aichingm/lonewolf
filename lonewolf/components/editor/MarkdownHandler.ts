
export default interface MarkdownHandler{
    renderImage(e: Element): void;
    linkClicked(e: Event): boolean;
}

export class VoidMarkdownHandler implements MarkdownHandler {
    public renderImage(_e: Element){console.log("VoidMarkdownHandler.renderImage")}
    public linkClicked(_e: Event){console.log("VoidMarkdownHandler.linkClicked"); return true}

}
