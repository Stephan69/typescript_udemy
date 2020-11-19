// autobind decorator
interface IValidateable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number,
}

function validateInput(validateable: IValidateable): boolean {

    let isValid = true;
    if (validateable.required) {
        isValid = isValid && validateable.value.toString().trim().length !== 0;
    }
    if (validateable.minLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length >= validateable.minLength;
    }
    if (validateable.maxLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length <= validateable.maxLength;
    }
    if (validateable.min != null && typeof validateable.value === 'number') {
        isValid = isValid && validateable.value >= validateable.min;
    }
    if (validateable.max != null && typeof validateable.value === 'number') {
        isValid = isValid && validateable.value <= validateable.max;
    }
    return isValid;
}

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

// ProjectInput Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById(
            'project-input'
        )! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

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
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        // define validateables
        const titleValidateable: IValidateable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidateable: IValidateable = {
            value: enteredDescription,
            required: true,
            minLength : 5,
        };
        const peopleValidateable: IValidateable = {
            value: +enteredPeople,
            required: true,
            min: 0,
            max: 10,
        };

        if (
            !validateInput(titleValidateable) ||
            !validateInput(descriptionValidateable) ||
            !validateInput(peopleValidateable)
        ) {
            alert('Invalid input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
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
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const prjInput = new ProjectInput();
