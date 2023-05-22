const markdown = `

Headlines
=========

# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

Hhorizontal Rules
=================

***
---

Paragraph
=========

Markdown is a lightweight markup language for creating formatted text using a plain-text editor. John Gruber and **Aaron Swartz** created Markdown in \`2004\` as a markup language that is appealing to human readers in its source code form. Markdown is widely used in blogging, instant messaging, *online forums*, collaborative software, documentation pages, and readme files. This text is copied from [Wikipedia - Markdown](https://en.wikipedia.org/wiki/Markdown)

[Marked] and [Markdownit] are two popular markdown parser written in javascript.

[Marked]: https://github.com/markedjs/marked/
[Markdownit]: http://daringfireball.net/projects/markdown/

Emoji
=====

This is a text with :wink: emoji.

Images
======

![Single Block Image](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)

This is a text with ![an inline image](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg).

Lists
=====

1. The Castle
2. The Great Wall of China
3. The Trial
4. America
5. The Diaries Of Franz Kafka

- He always slept on his right side.
- He has to get up early (to start another dreadful day).
- He has a drawer and a alarm clock next to his bed.
- His mother calls him when he gets up to late.

* [ ] Write todo list app
* [ ] Write todo list
* [ ] Do all todos

1. fruits
    * apple
    * banana
2. vegetables
    - carrot
    - broccoli

Code
====

\`\`\`
This is just monospaced text!
\`\`\`

\`\`\`javascript
console.log(true)
\`\`\`


    <?php
    // print "Hello world!"
    echo "Hello world!";


Blockquotes
===========

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.


Tables
======

| Left~~~~~~~~~ |  ~~~Center~~~ | ~~~~~~~~Right |
| ------------- |:-------------:| -------------:|
| left          |     center    |         right |
| left          |     center    |         right |
| left          |     center    |         right |

HTML
======

<a href="foo">foo</a>

`
export default markdown
