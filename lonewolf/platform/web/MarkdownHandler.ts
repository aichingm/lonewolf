
import type MarkdownHandler from "@/components/editor/MarkdownHandler";
import type { Store as AttachmentStore } from "@/common/attachments/Store";
import { downloadUri } from "@/utils/download";

export class WebMarkdownHandler implements MarkdownHandler {

    private attachmentStore: AttachmentStore

    constructor(attachmentStore: AttachmentStore) {
        this.attachmentStore = attachmentStore
    }

    public renderImage(e: Element) {
        if (this.attachmentStore && e.hasAttribute("src")) {
            const location = e.getAttribute("src") as string // type annotation is ok because of hasAttribute("src")
            if(this.attachmentStore.shouldHandleLocation(location)) {
                this.attachmentStore.url(location).then((url)=>e.setAttribute("src", url))
            }
        }
    }

    public linkClicked(e: Event) {
        console.log("foo")
        if (e.target != null && "hasAttribute" in e.target) {
            const element = e.target as Element
            if (element.hasAttribute("href")) {
                const location = element.getAttribute("href") as string // type annotation is ok because of hasAttribute("href")
                if(this.attachmentStore.shouldHandleLocation(location)) {
                    this.attachmentStore.url(location).then(
                        (url) => this.attachmentStore.metadata(location).then(
                            (meta) =>downloadUri(meta.name, url)
                        )
                    )
                } else {
                    window.open(location, "_blank")
                }
            }
        }
        e.preventDefault()
        return false
    }
}

