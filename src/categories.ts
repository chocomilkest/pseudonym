import type { Category } from "./constants.ts"

const BOX_COLOR_IDLE  = '#111'
const BOX_COLOR_HOVER = '#000'
const TOGGLED_BOX_COLOR_IDLE  = '#ddd'
const TOGGLED_BOX_COLOR_HOVER = '#fff'

export class CategoryBlock {
    id: Category;
    displayName: string;
    imagePath: string;

    element: HTMLButtonElement | null;

    toggled: boolean;

    constructor(id: Category, displayName: string, imagePath: string) {
        this.id = id
        this.displayName = displayName
        this.imagePath = imagePath
        this.element = null
        this.toggled = false
    }

    initializeElement(parent: Element): HTMLButtonElement {
        const elem = document.createElement('button')

        elem.type = 'button'
        elem.id = "category-" + this.id
        elem.className = "game-category-block"
        elem.setAttribute('aria-pressed', 'false')

        const image = document.createElement('img')
        image.src = this.imagePath
        image.alt = this.displayName
        image.loading = 'lazy'
        image.decoding = 'async'

        const selectionIndicator = document.createElement('div')
        selectionIndicator.className = 'game-category-block-select'

        const title = document.createElement('div')
        title.className = 'game-category-block-title'
        title.textContent = this.displayName

        elem.append(image, selectionIndicator, title)
        elem.style.setProperty('--box-color',       BOX_COLOR_IDLE)
        elem.style.setProperty('--hover-box-color', BOX_COLOR_HOVER)

        parent.appendChild(elem)

        this.element = elem
        return elem
    }

    setDisplayName(name: string) {
        this.displayName = name
        const title = this.element?.querySelector('.game-category-block-title')
        const image = this.element?.querySelector('img')
        if (title) title.textContent = name
        if (image) image.alt = name
    }

    toggle() {
        this.toggled = !this.toggled
        this.element?.setAttribute('aria-pressed', this.toggled.toString())

        if (this.toggled) {
            this.element?.style.setProperty('--box-color',       TOGGLED_BOX_COLOR_IDLE)
            this.element?.style.setProperty('--hover-box-color', TOGGLED_BOX_COLOR_HOVER)
        } else {
            this.element?.style.setProperty('--box-color',       BOX_COLOR_IDLE)
            this.element?.style.setProperty('--hover-box-color', BOX_COLOR_HOVER)
        }
    }

}
