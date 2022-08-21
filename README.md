# Lonewolf

## Container

Build image:

```
cd container && podman build .. -f Dockerfile -t lonewolf:build
```


## App

Start container

```
podman run --rm -it -p 5173:5173 -v .:/app lonewolf:build bash
```

Run the app in dev mode

```
npm run dev -- --host
```

Build the app artifacts

```
npm run build
```

## Libraries

### Framework

* https://vuejs.org/

### Routing

* https://router.vuejs.org/

### Storage

* https://pinia.vuejs.org/

### UI

* https://www.naiveui.com/

### Icons

* https://icon-sets.iconify.design/fluent/

### Markdown

#### Candidates

1. <https://github.com/Saul-Mirone/milkdown> [https://milkdown.dev/](website)
    * https://github.com/Saul-Mirone/awesome-milkdown
    * https://github.com/LittleSound/milkdown-plugin-image-picker
    * https://github.com/Yumamama00/vue3-milkdown-sample
1. https://github.com/anthonygarvan/marktwo
1. https://github.com/danloh/mdSilo-app
    * https://mdsilo.com/
    * https://github.com/danloh/mdSilo-app
    * React markdown editor https://github.com/outline/rich-markdown-editor
    * Missing https://npm.io/package/mdsmirror github page
1. https://github.com/ocavue/rino
1. https://github.com/voracious/ink-mde
    * https://github.com/voracious/ink-mde/tree/main/packages/vue
    * https://github.com/voracious/vue-ink
1. https://github.com/Vanessa219/vditor
1. https://github.com/Ionaru/easy-markdown-editor
1. https://github.com/barelyhuman/mark
1. https://github.com/syfxlin/tiptap-starter-kit
1. https://github.com/sparksuite/simplemde-markdown-editor
    * https://github.com/findingorder/fo-markdown-note
1. https://github.com/lepture/editor
1. https://github.com/imzbf/md-editor-v3
    * https://github.com/imzbf/md-editor-rt
1. https://github.com/retronav/ixora
1. https://github.com/tuture-dev/editure
1. https://github.com/cloverhearts/quilljs-markdown
1. https://github.com/nasa8x/v-markdown-editor

#### Other

* Image Plugin for Codemirror https://github.com/Rovak/InlineAttachment/
* Image upload for simplemde https://github.com/sparksuite/simplemde-markdown-editor/issues/328
* Android Markdown App https://github.com/saket/press
* List of Markdown Editors https://github.com/mundimark/awesome-markdown-editors
* Interesting offline editors built with web tech
    * https://github.com/danloh/mdSilo-app
    * https://github.com/FPurchess/blank
    * https://github.com/benrbray/noteworthy
    * https://www.phodit.com/
    * https://github.com/AppFlowy-IO/appflowy
* Good looking two pane editor https://github.com/g-ravity/markit
* QT based markdown editor https://github.com/cengels/skywriter

#### Dead

1. https://github.com/TrendingTechnology/twinkles

### Boards

#### Readups
* https://madewithvuejs.com/draggable-kanban-board
    * Example https://codesandbox.io/s/animated-draggable-kanban-board-with-tailwind-and-vue-1ry0p
* https://github.com/ayazsayyed/vue-kanban
* Drag and Drop in vue https://learnvue.co/tutorials/vue-drag-and-drop

### Implemantations

* https://github.com/plankanban/planka
* https://vikunja.io/
* https://www.taiga.io/
* https://github.com/kanbanik/kanbanik
* https://github.com/wkrzywiec/kanban-board
* https://github.com/fo0/ScrumTool
* https://github.com/Belovedbb/Board-wars
* https://github.com/cedric-gormond/kanban
* https://github.com/bartq98/kanban_webapp
* https://github.com/theonedev/onedev
* https://github.com/digitalfondue/lavagna
* https://github.com/MyCollab/mycollab
* https://github.com/wargio/OpenKanban
* https://github.com/RestyaPlatform/board
* https://github.com/kiswa/TaskBoard
* https://github.com/mattermost/focalboard
* https://github.com/kanboard/kanboard
* https://github.com/wekan/wekan
* https://github.com/JordanKnott/taskcafe
* https://github.com/nikku/wuffle
* https://github.com/heysafronov/fogga-kanban
* https://github.com/sarmadsangi/offline-kanban
* https://github.com/iamkumaran/KanbanApp
* https://github.com/mathieudutour/StroopWafel
* https://github.com/PawanKolhe/BoardX
* https://github.com/jtvberg/Moby
* https://github.com/JoaoCFN/Simple_Kanban_Board
* https://github.com/Boyu1997/kanban-board
* https://github.com/bon988/kabanBoard
* https://github.com/VallariAg/kanban

* https://trello.com/
* https://huntr.co/

#### Offline

* https://projscope.com


### Theory

* https://kanbanize.com/de/kanban-ressourcen/kanban-erste-schritte/kanban-enzyklopaedie



