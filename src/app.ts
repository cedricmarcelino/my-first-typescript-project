function Autobind(_: any, _2: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value
    const newDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFunction = originalMethod.bind(this)
            return boundFunction
        }
    }
    return newDescriptor
}


class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title')! 
        this.descriptionInputElement = this.element.querySelector('#description')! 
        this.peopleInputElement = this.element.querySelector('#people')! 


        this.configure()
        this.attach()
    }

        @Autobind
        private submitForm (event: Event) {
            event.preventDefault()
            console.log(this.titleInputElement.value)
        }

        private configure() {
            this.element.addEventListener('submit', this.submitForm)
        }


        private attach() {
            this.hostElement.insertAdjacentElement('afterbegin', this.element)
        }
}

const projectInput = new ProjectInput()