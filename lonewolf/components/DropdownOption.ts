import type { DropdownRenderOption, DropdownOption as NDropdownOption , DropdownGroupOption, DropdownDividerOption} from 'naive-ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DropdownOption = (NDropdownOption | DropdownGroupOption | DropdownDividerOption | DropdownRenderOption) & {command: string, data: any}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function staticOption(command: string, key: string | number, label: string, data: any, disabled?: boolean): DropdownOption {
    return { command: command, key: key, label: label, data: data, disabled: disabled === true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupOption(command: string, key: string | number, label: string, data: any, children: DropdownOption[], disabled?: boolean): DropdownOption {
    return { command: command, key: key, label: label, data: data, children: children, disabled: disabled === true }
}

