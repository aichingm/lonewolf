export type EditorStyle = {
    darkMode: boolean
}

export function fill(s: Partial<EditorStyle>): EditorStyle {
    return {
        darkMode: s.darkMode || false,
    }
}

export type Style = Partial<EditorStyle>

