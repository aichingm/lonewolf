
import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "@/common/logs/LogEntry";

export enum Kind {
    None,
    NewList,
    PropertyChange,
}

export function typeOf(e: LogEntry): Kind {
    if (e.action == LogAction.Create && e.subjectKind == LogKind.List && e.objectKind == LogKind.None) {
        return Kind.NewList
    } else if (e.objectKind == LogKind.Property && e.action == LogAction.Change) {
        return Kind.PropertyChange
    }
    return Kind.None
}
