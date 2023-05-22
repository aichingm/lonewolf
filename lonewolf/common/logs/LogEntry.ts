import { v4 as uuid } from "uuid";


export enum Kind {
    None,
    Board,
    List,
    Card,
    Label,
    Attachment,
    Property,
    Comment,
    // NOTICE: Make sure that you only append new values here DO NOT REORDER!!
}

export enum Action {
    None,
    Delete,
    Create,
    Change,
    Connect,
    Disconnect,
    // NOTICE: Make sure that you only append new values here DO NOT REORDER!!
}

export enum Version {
    V0
}

export class Entry {
    public version: Version = Version.V0
    public id: string = ""
    public subjectId: string = ""
    public subjectKind: Kind = Kind.None
    public objectId: string = ""
    public objectKind: Kind = Kind.None
    public action: Action = Action.None
    public timestamp: number = 0
    public initiator: string = ""
    public args: string[] = []

    constructor(){
        this.id = uuid()
    }

    public setId(id: string): Entry{
        this.id = id
        return this;
    }

    public setVersion(version: Version): Entry{
        this.version = version
        return this;
    }

    public setSubjectId(subjectId: string): Entry{
        this.subjectId = subjectId
        return this;
    }

    public setSubjectKind(subjectKind: Kind): Entry{
        this.subjectKind = subjectKind
        return this;
    }

    public setAction(action: Action): Entry{
        this.action = action
        return this;
    }

    public setTimestamp(timestamp: number): Entry{
        this.timestamp = timestamp
        return this;
    }

    public setInitiator(initiator: string): Entry{
        this.initiator = initiator
        return this;
    }

    public setArguments(...args: string[]): Entry{
        this.args = args
        return this;
    }

    public setObjectId(objectId: string): Entry{
        this.objectId = objectId
        return this;
    }

    public setObjectKind(objectKind: Kind): Entry{
        this.objectKind = objectKind
        return this;
    }

    public static fromSerializable(e: SerializableEntry) {
        return (new Entry())
        .setId(e.id)
        .setVersion(e.version)
        .setSubjectId(e.subjectId)
        .setSubjectId(e.subjectId)
        .setSubjectKind(e.subjectKind)
        .setObjectId(e.objectId)
        .setObjectKind(e.objectKind)
        .setAction(e.action)
        .setTimestamp(e.timestamp)
        .setInitiator(e.initiator)
        .setArguments(...e.args)
    }

}


export class SerializableEntry {
    public version: Version = Version.V0
    public id: string = ""
    public subjectId: string = ""
    public subjectKind: Kind = Kind.None
    public objectId: string = ""
    public objectKind: Kind = Kind.None
    public action: Action = Action.None
    public timestamp: number = 0
    public initiator: string = ""
    public args: string[] = []
}
