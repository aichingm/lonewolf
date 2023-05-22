export default class ActionDropdownOption {
    public key: string | number = "This is not a good key";
    public label = "";
    public command: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: any = null;
    public children: ActionDropdownOption[] | null | undefined = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public props: any = null;
    public disabled = false;

    constructor(
        key: string | number,
        label: string,
        command: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any,
        children: ActionDropdownOption[] | null,
        disabled: boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any
    ) {
        this.key = key;
        this.label = label;
        this.command = command;
        this.data = data;
        this.children = children;
        this.disabled = disabled;
        this.props = props;
    }
}
