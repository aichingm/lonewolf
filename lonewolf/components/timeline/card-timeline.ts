
import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "@/common/logs/LogEntry";

export enum Kind {
    None,
    NewCard,
    PropertyChange,
    LabelAdd,
    LabelRemove,
    AttachmentAdd,
    AttachmentRemove,
    CommentAdd,
    CommentRemove,
    CardMove,
    AttachmentChange,

}

export function typeOf(e: LogEntry): Kind {
    if (e.action == LogAction.Create && e.subjectKind == LogKind.Card && e.objectKind == LogKind.None) {
        return Kind.NewCard
    } else if (e.objectKind == LogKind.Property && e.action == LogAction.Change) {
        return e.objectId == "list" ? Kind.CardMove : Kind.PropertyChange
    } else if(e.objectKind == LogKind.Label){
        return e.action == LogAction.Connect ? Kind.LabelAdd : Kind.LabelRemove
    } else if(e.objectKind == LogKind.Attachment){
        if(e.action == LogAction.Connect){
            return Kind.AttachmentAdd
        } else if(e.action == LogAction.Disconnect) {
            return Kind.AttachmentRemove
        } else if(e.action == LogAction.Change) {
            return Kind.AttachmentChange
        }
        return Kind.None
    } else if(e.objectKind == LogKind.Comment){
        return e.action == LogAction.Connect ? Kind.CommentAdd : Kind.CommentRemove
    }
    return Kind.None
}
