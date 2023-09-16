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

    public constructor(tc: Partial<ToolbarConfig>) {
        Object.assign(this, tc);
    }

    public static withAll(): Partial<ToolbarConfig> {
        return {
            showCreateBold: true,
            showCreateItalic: true,
            showCreateCode: true,
            showCreateLink: true,
            showCreateImage: true,
            showCreateHeadline1: true,
            showCreateCodeFence: true,
            showCreateList: true,
            showCreateOrderedList: true,
            showCreateTaskList: true,
            showCreateBlockquote: true,
            showCreateTable: true,
            showAddFile: supportsChooseFile(),
            showMarkdownReference: true,
            showPreviewToggle: false,
            saveable: true,
            saveIcon: "fluent:save-20-regular",
            resetable: true,
        }
    }

    public static forNewComment(): Partial<ToolbarConfig> {
        return {
            showCreateBold: true,
            showCreateItalic: true,
            showCreateCode: true,
            showCreateLink: true,
            showCreateImage: true,
            showCreateHeadline1: false,
            showCreateCodeFence: true,
            showCreateList: true,
            showCreateOrderedList: true,
            showCreateTaskList: false,
            showCreateBlockquote: true,
            showCreateTable: false,
            showAddFile: supportsChooseFile(),
            showMarkdownReference: false,
            showPreviewToggle: false,
            saveable: true,
            saveIcon: "fluent:comment-add-20-regular",
            resetable: false,
        }
    }

    public static forComment(): Partial<ToolbarConfig> {
        return {saveIcon: "fluent:save-20-regular"}
    }

}
