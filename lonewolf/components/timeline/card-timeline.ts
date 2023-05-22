
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

}

export function typeOf(e: LogEntry): Kind {
    if (e.action == LogAction.Create && e.subjectKind == LogKind.Card && e.objectKind == LogKind.None) {
        return Kind.NewCard
    } else if (e.objectKind == LogKind.Property && e.action == LogAction.Change) {
        return e.objectId == "list" ? Kind.CardMove : Kind.PropertyChange
    } else if(e.objectKind == LogKind.Label){
        return e.action == LogAction.Connect ? Kind.LabelAdd : Kind.LabelRemove
    } else if(e.objectKind == LogKind.Attachment){
        return e.action == LogAction.Connect ? Kind.AttachmentAdd : Kind.AttachmentRemove
    } else if(e.objectKind == LogKind.Comment){
        return e.action == LogAction.Connect ? Kind.CommentAdd : Kind.CommentRemove
    }
    return Kind.None
}
