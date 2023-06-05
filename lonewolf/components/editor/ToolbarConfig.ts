import { supportsChooseFile } from "@/platform/Functions";


export default class ToolbarConfig {
    showCreateBold = false;
    showCreateItalic = false;
    showCreateCode = false;
    showCreateLink = false;
    showCreateImage = false;
    showCreateHeadline1 = false;
    showCreateCodeFence = false;
    showCreateList = false;
    showCreateOrderedList = false;
    showCreateTaskList = false;
    showCreateBlockquote = false;
    showCreateTable = false;
    showAddFile = false;
    showMarkdownReference = false
    showPreviewToggle = false;
    saveable = false;
    saveIcon = "fluent:save-20-regular";
    resetable = false;

    public static withAll(): ToolbarConfig {
        const t = new ToolbarConfig()
        t.showCreateBold = true;
        t.showCreateItalic = true;
        t.showCreateCode = true;
        t.showCreateLink = true;
        t.showCreateImage = true;
        t.showCreateHeadline1 = true;
        t.showCreateCodeFence = true;
        t.showCreateList = true;
        t.showCreateOrderedList = true;
        t.showCreateTaskList = true;
        t.showCreateBlockquote = true;
        t.showCreateTable = true;
        t.showAddFile = supportsChooseFile();
        t.showMarkdownReference = true
        t.showPreviewToggle = false;
        t.saveable = true;
        t.saveIcon = "fluent:save-20-regular";
        t.resetable = true;


        return t
    }

    public static forNewComment(): ToolbarConfig {
        const t = new ToolbarConfig()
        t.showCreateBold = true;
        t.showCreateItalic = true;
        t.showCreateCode = true;
        t.showCreateLink = true;
        t.showCreateImage = true;
        t.showCreateHeadline1 = false;
        t.showCreateCodeFence = true;
        t.showCreateList = true;
        t.showCreateOrderedList = true;
        t.showCreateTaskList = false;
        t.showCreateBlockquote = true;
        t.showCreateTable = false;
        t.showAddFile = supportsChooseFile();
        t.showMarkdownReference = false
        t.showPreviewToggle = false;
        t.saveable = true;
        t.saveIcon = "fluent:comment-add-20-regular";
        t.resetable = false;

        return t
    }

    public static forComment(): ToolbarConfig {
        const t = ToolbarConfig.forNewComment()
        t.saveIcon = "fluent:save-20-regular";
        return t
    }

}
