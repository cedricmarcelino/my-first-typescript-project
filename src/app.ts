//Project Type
enum ProjectStatus {
    Active, Finished
}

class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus ) {

    }
}

//State Management
type Listener = (items: Project[]) => void


class ProjectState {
    private listeners: Listener[] = []
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {

    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        } 
        this.instance = new ProjectState()
        return this.instance
    }

    addListener(listenerFn: Listener){
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
            )
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance()


//Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
}

function validate(validatableInput: Validatable){
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && (validatableInput.value.toString().trim().length !== 0 )
    }

    if ( validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }

    if ( validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }

    if (validatableInput.minValue != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.minValue
    }

    if (validatableInput.maxValue != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.maxValue
    }

    return isValid
}

//Autobind decorator
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

//Class for project list
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished'){
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement
        this.assignedProjects = []

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        projectState.addListener( (projects: Project[]) => {
            const relevantProjects = projects.filter( prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            } )
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

        this.attach()
        this.renderContent()
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = ''
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li')
            listItem.textContent = projectItem.title
            listEl.appendChild(listItem)
        }
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

}

//Class for project form
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
    
    private getUserInput(): [string, string, number] | void{ //Tuples
        const inputTitle = this.titleInputElement.value
        const inputDesc = this.descriptionInputElement.value
        const inputPeople = this.peopleInputElement.value

        const titleValidatable: Validatable = {
            value: inputTitle,
            required: true,
            minLength: 6,
            maxLength: 24
        }

        const descValidatable: Validatable = {
            value: inputDesc,
            required: true,
            minLength: 8,
            maxLength: 150
        }
        
        const peopleValidatable: Validatable = {
            value: +inputPeople,
            required: true,
            minValue: 1,
            maxValue: 5,
        }

        if (
            !validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable) 
        ) {
            alert('All fields are required.')
            return
        } else {
            return [inputTitle, inputDesc, +inputPeople]
        }
    }

    private clearInputFields() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @Autobind
    private submitForm (event: Event) {
        event.preventDefault()
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)){
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people)
            this.clearInputFields()
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitForm)
    }


    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')