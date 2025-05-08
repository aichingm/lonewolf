
import { marked } from 'marked';
import type { Token, Tokens } from 'marked'


export function taskStats(md: string): number[] {
    return taskStatTokens(marked.lexer(md))
}

function taskStatTokens(tokens: Token[]): number[] {
    return tokens.map(t=>taskStatToken(t)).reduce((a, v)=>[a[0]+v[0], a[1]+v[1]], [0, 0])
}

function taskStatToken(token: Token): number[] {

    if (token.type == "list_item") {
        if (token.tokens != undefined) {
            const sub = taskStatTokens(token.tokens)
            return [sub[0] + (token.task && token.checked?1:0), sub[1] + (token.task?1:0)]
        }
        return [0, 0]
    }

    if(token.type == "list"){
        const t = token as Tokens.List
        if (t.items != undefined) {
            return taskStatTokens(t.items)
        }
    }

    const t = token as Tokens.Generic
    if (t.tokens != undefined) {
        return taskStatTokens(t.tokens)
    }

    return [0,0]

}
