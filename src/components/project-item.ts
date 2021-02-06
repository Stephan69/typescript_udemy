import {Component} from "./base-component.js";
import {Draggable} from "../models/drag-drop.js";
import {Project} from "../models/project.js";
import {autobind} from "../decorators/autobind.js";

// ProjectItem Class
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    private projectItem: Project;

    get persons() {
        if (this.projectItem.people === 1) {
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

    @autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.projectItem.id);
        event.dataTransfer!.dropEffect = 'move';
    }

    dragEndHandler(_: DragEvent) {
        console.log(event);
    }

    @autobind
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.projectItem.title;
        this.element.querySelector('h3')!.textContent = this.persons + 'assigned';
        this.element.querySelector('p')!.textContent = this.projectItem.description;
    }
}
