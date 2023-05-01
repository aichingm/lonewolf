import { v4 as uuid } from "uuid";

export class SimpleData {
    public id = "";
    public version = "";

    constructor (id: string, version: string) {
        this.id = id;
        this.version = version;
    }

    public reset() {
        this.version = uuid()
    }

}

export class SDRoot extends SimpleData{
    public board: SDBoard

    constructor (id: string, version: string, board: SDBoard) {
        super(id, version)
        this.board = board
    }

}

export class SDCardHolder extends SimpleData{
    public card: SDCard

    constructor (card: SDCard) {
        super("", "")
        this.card = card
    }

}

export class SDListHolder extends SimpleData{
    public list: SDList

    constructor (list: SDList) {
        super("", "")
        this.list = list
    }

}

export class SDBoard extends SimpleData{
    public lists = new Array<SDList>();
    public cardArchive = new SDList("Archive", uuid());
    public listArchive = new Array<SDList>();
    public labels = new Array<SDLabel>();
    public settings = new SimpleData("settings", uuid());

    public reset() {
        super.reset()
        this.lists.splice(0, this.lists.length)
        this.labels.splice(0, this.labels.length)
        this.settings.version = uuid()
    }

}

export class SDList  extends SimpleData{
    public cards = new Array<SDCard>();

    public reset() {
        super.reset()
        this.cards.splice(0, this.cards.length)
    }

}

export class SDCard  extends SimpleData{

}

export class SDLabel  extends SimpleData{

}
