
import type IMarkdownHandler from "@/components/editor/MarkdownHandler";
import type { Store as AttachmentStore } from "@/common/attachments/Store";
import { openFile } from "./Files";


export class MarkdownHandler implements IMarkdownHandler {

    private attachmentStore: AttachmentStore

    constructor(attachmentStore: AttachmentStore) {
        this.attachmentStore = attachmentStore
    }

    public renderImage(e: Element) {
        if (this.attachmentStore && e.hasAttribute("src")) {
            const location = e.getAttribute("src") as string // type annotation is ok because of hasAttribute("src")
            if (!this.attachmentStore.shouldHandleLocation(location) && !location.startsWith("http://") && !location.startsWith("https://")){
                if(location.startsWith("/")){
                    e.setAttribute("src", "fs://absolute.local" + location)
                } else {
                    e.setAttribute("src", "fs://relative.local/" + location)
                }
            }
        }
    }

    public updateImage(e: Element) {
        if (this.attachmentStore && e.hasAttribute("src")) {
            const location = e.getAttribute("src") as string // type annotation is ok because of hasAttribute("src")
            if(this.attachmentStore.shouldHandleLocation(location)) {
                this.attachmentStore.url(location).then((url)=>e.setAttribute("src", url))
            }
        }
    }

    public linkClicked(e: Event) {
        if (e.target != null && "hasAttribute" in e.target && "tagName" in e.target &&  e.target.tagName == "A") {
            const element = e.target as HTMLAnchorElement
            if (element.hasAttribute("href")) {
                const location = element.getAttribute("href") as string // type annotation is ok because of hasAttribute("href")
                if(this.attachmentStore.shouldHandleLocation(location)) {
                    this.attachmentStore.url(location).then(
                        (url) => this.attachmentStore.metadata(location).then(
                            (meta) => {
                                openFile(meta.name, url)
                            }
                        )
                    )
                } else if (element.origin == window.location.origin) {
                    if(location.startsWith("/")){
                        openFile(element.textContent || "Unnamed File", "fs://absolute.local" + location)
                    } else {
                        openFile(element.textContent || "Unnamed File", "fs://relative.local/" + location)
                    }
                } else {
                    openFile(element.textContent || "Unnamed File", location)
                }
            }
        }
        e.preventDefault()
        return false
    }
}
