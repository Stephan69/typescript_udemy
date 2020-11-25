// Interface for drag and drop
interface Draggable {
    startDragHandler(event: DragEvent): void;
    endDragHandler(event: DragEvent): void;
}
interface Dragtarget {
    startDropHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    leaveDropHandler(event: DragEvent): void;
}

enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(public id: string,
                public title: string,
                public description: string,
                public people: number,
                public status: ProjectStatus) {
    }
}

// type listener
type Listener<T> = (items: T[]) => void;

// Base class for general state
class State<T>{
    protected listeners: Listener<T>[] = [];

    constructor() {
    }

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

// Project State Management
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        )

        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

abstract class Component<U extends HTMLElement, T extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: U;
    element: T;

    protected constructor(templateEl: string, hostElement: string, beforeAfter: boolean, elementId?: string,) {
        this.templateElement = document.getElementById(templateEl) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElement)! as U;

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedNode.firstElementChild as T;

        if (elementId) {
            this.element.id = elementId;
        }

        this.attach(beforeAfter);
    }

    private attach(afterBefore: boolean) {
        this.hostElement.insertAdjacentElement(afterBefore ? 'beforeend' : 'afterbegin', this.element);
    }

    abstract renderContent(): void;
    abstract configure(): void;

}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable{
    private projectItem: Project;

    get persons(){
        if (this.projectItem.people === 1){
            return '1 person ';
        } else {
            return `${this.projectItem.people} persons `;
        }
    }

    constructor(hostElementId: string, project: Project) {
        super('single-project', hostElementId, false, project.id);
        this.projectItem = project;

        this.configure();
        this.renderContent();

    }

    startDragHandler(event: DragEvent) {
        console.log(event);
    }
    endDragHandler(_: DragEvent) {
        console.log(event);
    }

    @autobind
    configure() {
        this.element.addEventListener('dragstart', this.startDragHandler);
        this.element.addEventListener('dragend', this.endDragHandler);
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.projectItem.title;
        this.element.querySelector('h3')!.textContent = this.persons + 'assigned';
        this.element.querySelector('p')!.textContent = this.projectItem.description;
    }
}


// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {

        super('project-list', 'app', true, `${type}-projects`);

        this.assignedProjects = [];

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter((project) => {
                    if (this.type === 'active') {
                        return project.status === ProjectStatus.Active;
                    } else
                        return project.status === ProjectStatus.Finished;
                }
            )
            this.renderProjects();
        });

        this.configure();
        this.renderContent();
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }

    configure() {
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(listEl.id, prjItem);
        }
    }
}


// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {

        super('project-input', 'app', false, 'user-input');

        this.titleInputElement = this.element.querySelector(
            '#title'
        ) as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector(
            '#description'
        ) as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector(
            '#people'
        ) as HTMLInputElement;

        this.configure();
        this.renderContent();

    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() {
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
